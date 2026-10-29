"""Shared test fixtures for Quizzy backend tests."""
import tempfile
import pytest

from app import create_app


@pytest.fixture
def app(tmp_path):
    """Create application with testing config and an isolated temp session dir."""
    test_app = create_app("testing")
    test_app.config.update({
        "SESSION_DIR": str(tmp_path / "sessions"),
        "SESSION_TTL_SECONDS": 3600,
        "TRIVIA_API_BASE_URL": "https://opentdb.com/api.php",
        "TRIVIA_API_TIMEOUT": 5.0,
    })
    # Reinitialise session store with isolated directory
    from app.services import QuizSessionStore
    test_app.session_store = QuizSessionStore(
        session_dir=str(tmp_path / "sessions"),
        ttl_seconds=3600,
    )
    yield test_app


@pytest.fixture
def client(app):
    """Flask test client."""
    return app.test_client()


@pytest.fixture
def sample_opentdb_response():
    """Minimal valid Open Trivia DB response payload with 2 questions."""
    return {
        "response_code": 0,
        "results": [
            {
                "type": "multiple",
                "difficulty": "easy",
                "category": "Science &amp; Nature",
                "question": "What is H&lt;sub&gt;2&lt;/sub&gt;O?",
                "correct_answer": "Water",
                "incorrect_answers": ["Salt", "Sugar", "Oil"],
            },
            {
                "type": "multiple",
                "difficulty": "easy",
                "category": "Science &amp; Nature",
                "question": "What planet is closest to the Sun?",
                "correct_answer": "Mercury",
                "incorrect_answers": ["Venus", "Earth", "Mars"],
            },
        ],
    }
