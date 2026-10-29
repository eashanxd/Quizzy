import json
import logging
import os
import shutil
import tempfile
import time
from pathlib import Path
from threading import Lock
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


class QuizSessionStore:
    """Server-side session store for quiz state.
    
    Persists quiz session state to a configured directory to avoid relying solely
    on in-memory global state, supporting multi-worker execution and persistence
    across process restarts without needing an external database.
    """

    def __init__(self, session_dir: Optional[str] = None, ttl_seconds: int = 7200):
        self.session_dir = Path(session_dir) if session_dir else Path(tempfile.gettempdir()) / "quizzy_sessions"
        self.ttl_seconds = ttl_seconds
        self._lock = Lock()
        self._cache: Dict[str, Dict[str, Any]] = {}
        
        # Ensure session directory exists
        try:
            self.session_dir.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            logger.warning("Could not create session directory %s: %s", self.session_dir, e)

    def _get_session_path(self, quiz_id: str) -> Path:
        # Sanitize quiz_id to prevent directory traversal
        safe_id = "".join(c for c in quiz_id if c.isalnum() or c in "-_")
        return self.session_dir / f"{safe_id}.json"

    def save_session(self, quiz_id: str, data: Dict[str, Any]) -> None:
        """Save a quiz session with creation timestamp and expiry."""
        payload = {
            "quiz_id": quiz_id,
            "created_at": time.time(),
            "expires_at": time.time() + self.ttl_seconds,
            "data": data,
        }
        
        with self._lock:
            self._cache[quiz_id] = payload

        file_path = self._get_session_path(quiz_id)
        try:
            # Atomic file write using a temporary file in the same directory
            temp_path = file_path.with_suffix(".tmp")
            with open(temp_path, "w", encoding="utf-8") as f:
                json.dump(payload, f)
            temp_path.replace(file_path)
        except Exception as e:
            logger.error("Failed to persist session %s to disk: %s", quiz_id, e)

    def get_session(self, quiz_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve active quiz session data. Returns None if missing or expired."""
        now = time.time()

        # Check in-memory cache first
        with self._lock:
            cached = self._cache.get(quiz_id)
            if cached:
                if cached.get("expires_at", 0) > now:
                    return cached.get("data")
                else:
                    # Expired in cache
                    del self._cache[quiz_id]

        # Check disk storage
        file_path = self._get_session_path(quiz_id)
        if not file_path.exists():
            return None

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                payload = json.load(f)

            if payload.get("expires_at", 0) <= now:
                # Expired on disk, clean up
                self.delete_session(quiz_id)
                return None

            with self._lock:
                self._cache[quiz_id] = payload

            return payload.get("data")
        except Exception as e:
            logger.error("Failed to read session %s from disk: %s", quiz_id, e)
            return None

    def delete_session(self, quiz_id: str) -> None:
        """Delete a session from cache and disk."""
        with self._lock:
            self._cache.pop(quiz_id, None)

        file_path = self._get_session_path(quiz_id)
        try:
            if file_path.exists():
                file_path.unlink()
        except Exception as e:
            logger.warning("Failed to remove session file %s: %s", file_path, e)

    def cleanup_expired(self) -> int:
        """Remove all expired session files from disk and memory cache."""
        now = time.time()
        removed_count = 0

        with self._lock:
            expired_keys = [k for k, v in self._cache.items() if v.get("expires_at", 0) <= now]
            for k in expired_keys:
                del self._cache[k]

        if not self.session_dir.exists():
            return removed_count

        try:
            for file_path in self.session_dir.glob("*.json"):
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        payload = json.load(f)
                    if payload.get("expires_at", 0) <= now:
                        file_path.unlink()
                        removed_count += 1
                except Exception:
                    # Corrupt or unreadable file
                    try:
                        file_path.unlink()
                        removed_count += 1
                    except Exception:
                        pass
        except Exception as e:
            logger.error("Error during session cleanup: %s", e)

        return removed_count
