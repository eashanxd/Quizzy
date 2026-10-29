import html
import logging
import random
import urllib.parse
from typing import Any, Dict, List, Optional, Tuple
import requests

logger = logging.getLogger(__name__)

# Category mapping from canonical frontend names to Open Trivia DB IDs
CATEGORY_MAPPING: Dict[str, int] = {
    "science": 17,       # Science & Nature
    "technology": 18,    # Science: Computers
    "history": 23,       # History
    "entertainment": 11, # Entertainment: Film
}

# Display title mapping for stable frontend CategoryType
CATEGORY_DISPLAY_NAMES: Dict[str, str] = {
    "science": "Science",
    "technology": "Technology",
    "history": "History",
    "entertainment": "Entertainment",
}

DIFFICULTY_DISPLAY_NAMES: Dict[str, str] = {
    "easy": "Easy",
    "medium": "Medium",
    "hard": "Hard",
}

ALLOWED_AMOUNTS = {5, 10, 15, 20}
ALLOWED_CATEGORIES = set(CATEGORY_MAPPING.keys())
ALLOWED_DIFFICULTIES = set(DIFFICULTY_DISPLAY_NAMES.keys())


class TriviaError(Exception):
    """Base exception for trivia service errors."""
    def __init__(self, message: str, status_code: int = 500):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class TriviaValidationError(TriviaError):
    def __init__(self, message: str):
        super().__init__(message, status_code=400)


class TriviaTimeoutError(TriviaError):
    def __init__(self, message: str = "Upstream trivia service request timed out."):
        super().__init__(message, status_code=504)


class TriviaConnectionError(TriviaError):
    def __init__(self, message: str = "Failed to connect to upstream trivia service."):
        super().__init__(message, status_code=502)


class TriviaRateLimitError(TriviaError):
    def __init__(self, message: str = "Upstream trivia service rate limit reached. Please retry in a few seconds."):
        super().__init__(message, status_code=429)


class TriviaInsufficientQuestionsError(TriviaError):
    def __init__(self, message: str = "Insufficient questions available for the specified criteria."):
        super().__init__(message, status_code=422)


class TriviaMalformedResponseError(TriviaError):
    def __init__(self, message: str = "Received a malformed response from upstream trivia service."):
        super().__init__(message, status_code=502)


class TriviaUpstreamError(TriviaError):
    def __init__(self, message: str = "Upstream trivia service encountered an error.", status_code: int = 502):
        super().__init__(message, status_code=status_code)


def validate_quiz_params(category: Optional[str], difficulty: Optional[str], amount: Any) -> Tuple[str, str, int]:
    """Validate and normalize query parameters for question retrieval."""
    if not category:
        raise TriviaValidationError("Parameter 'category' is required. Allowed values: science, technology, history, entertainment.")
    
    norm_category = category.strip().lower()
    if norm_category not in ALLOWED_CATEGORIES:
        raise TriviaValidationError(
            f"Invalid category '{category}'. Allowed values: {', '.join(sorted(ALLOWED_CATEGORIES))}."
        )

    if not difficulty:
        raise TriviaValidationError("Parameter 'difficulty' is required. Allowed values: easy, medium, hard.")
    
    norm_difficulty = difficulty.strip().lower()
    if norm_difficulty not in ALLOWED_DIFFICULTIES:
        raise TriviaValidationError(
            f"Invalid difficulty '{difficulty}'. Allowed values: {', '.join(sorted(ALLOWED_DIFFICULTIES))}."
        )

    if amount is None or amount == "":
        raise TriviaValidationError("Parameter 'amount' is required. Allowed values: 5, 10, 15, 20.")

    try:
        norm_amount = int(amount)
    except (ValueError, TypeError):
        raise TriviaValidationError("Parameter 'amount' must be an integer. Allowed values: 5, 10, 15, 20.")

    if norm_amount not in ALLOWED_AMOUNTS:
        raise TriviaValidationError(
            f"Invalid amount '{amount}'. Allowed values: {', '.join(str(a) for a in sorted(ALLOWED_AMOUNTS))}."
        )

    return norm_category, norm_difficulty, norm_amount


def clean_text(text: str) -> str:
    """Decode HTML entities and URL encoded sequences from strings."""
    if not text:
        return ""
    # Open Trivia DB may return HTML entities or URL encoding
    unescaped = html.unescape(text)
    decoded = urllib.parse.unquote(unescaped)
    # Perform a second unescape in case of nested entities
    return html.unescape(decoded).strip()


def normalize_questions(
    raw_results: List[Dict[str, Any]],
    canonical_category: str,
    canonical_difficulty: str
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Normalize raw Open Trivia DB items into frontend schema.
    
    Returns:
        delivery_questions: Questions for client response with answers stripped.
        session_questions: Full questions with correct answer index for server evaluation.
    """
    delivery_questions = []
    session_questions = []

    cat_display = CATEGORY_DISPLAY_NAMES.get(canonical_category, canonical_category.title())
    diff_display = DIFFICULTY_DISPLAY_NAMES.get(canonical_difficulty, canonical_difficulty.title())

    for idx, item in enumerate(raw_results):
        qid = f"q-{idx + 1}"
        question_text = clean_text(item.get("question", ""))
        correct_ans = clean_text(item.get("correct_answer", ""))
        incorrect_answers = [clean_text(ans) for ans in item.get("incorrect_answers", [])]

        # Combine and shuffle options
        all_options = [correct_ans] + incorrect_answers
        random.shuffle(all_options)

        correct_index = all_options.index(correct_ans)
        explanation = f"The correct answer is: {correct_ans}"

        # Safe client delivery object (DOES NOT contain correct answer info)
        delivery_questions.append({
            "id": qid,
            "category": cat_display,
            "difficulty": diff_display,
            "question": question_text,
            "options": all_options,
        })

        # Server-side authoritative object (retains correct answer index and explanation)
        session_questions.append({
            "id": qid,
            "category": cat_display,
            "difficulty": diff_display,
            "question": question_text,
            "options": all_options,
            "correctAnswerIndex": correct_index,
            "explanation": explanation,
        })

    return delivery_questions, session_questions


def fetch_questions_from_opentdb(
    category: str,
    difficulty: str,
    amount: int,
    base_url: str = "https://opentdb.com/api.php",
    timeout: float = 10.0,
    session: Optional[requests.Session] = None
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Fetch trivia questions from Open Trivia DB and normalize responses."""
    category_id = CATEGORY_MAPPING[category]
    params = {
        "amount": amount,
        "category": category_id,
        "difficulty": difficulty,
        "type": "multiple",
    }

    http_client = session or requests

    try:
        response = http_client.get(base_url, params=params, timeout=timeout)
    except requests.exceptions.Timeout:
        logger.error("Timeout fetching questions from Open Trivia DB")
        raise TriviaTimeoutError()
    except requests.exceptions.ConnectionError:
        logger.error("Connection error fetching questions from Open Trivia DB")
        raise TriviaConnectionError()
    except requests.exceptions.RequestException as e:
        logger.error("Request error calling Open Trivia DB: %s", e)
        raise TriviaUpstreamError(f"Network error contacting upstream trivia service: {str(e)}")

    if response.status_code == 429:
        logger.warning("Upstream trivia service returned HTTP 429 Rate Limit")
        raise TriviaRateLimitError()

    if response.status_code != 200:
        logger.error("Upstream trivia service returned HTTP %s", response.status_code)
        raise TriviaUpstreamError(f"Upstream trivia service returned HTTP status {response.status_code}")

    try:
        data = response.json()
    except Exception as e:
        logger.error("Failed to parse JSON response from Open Trivia DB: %s", e)
        raise TriviaMalformedResponseError()

    if not isinstance(data, dict) or "response_code" not in data or "results" not in data:
        logger.error("Malformed response schema from Open Trivia DB: %s", data)
        raise TriviaMalformedResponseError()

    code = data["response_code"]
    if code == 0:
        # Success
        results = data.get("results", [])
        if len(results) < amount:
            logger.warning("Requested %d questions, received only %d from upstream", amount, len(results))
            raise TriviaInsufficientQuestionsError(
                f"Requested {amount} questions, but only {len(results)} questions were available."
            )
        return normalize_questions(results, category, difficulty)

    elif code == 1:
        # No results / insufficient questions
        logger.info("Open Trivia DB response code 1 (No results) for cat=%s, diff=%s, amt=%d", category, difficulty, amount)
        raise TriviaInsufficientQuestionsError()

    elif code == 2:
        # Invalid parameter
        logger.error("Open Trivia DB response code 2 (Invalid parameter) for query: %s", params)
        raise TriviaUpstreamError("Upstream service rejected query parameters as invalid.")

    elif code in (3, 4):
        # Token not found / Token empty
        logger.error("Open Trivia DB session token error: %d", code)
        raise TriviaUpstreamError("Upstream trivia session error.")

    elif code == 5:
        # Rate limit
        logger.warning("Open Trivia DB response code 5 (Rate limit)")
        raise TriviaRateLimitError()

    else:
        logger.error("Unexpected Open Trivia DB response code: %d", code)
        raise TriviaUpstreamError(f"Upstream trivia service returned unexpected code: {code}")
