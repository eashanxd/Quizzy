import secrets
from flask import Blueprint, current_app, jsonify, request
from app.services import (
    TriviaError,
    TriviaValidationError,
    fetch_questions_from_opentdb,
    score_quiz,
    validate_quiz_params,
)

api_bp = Blueprint("api", __name__, url_prefix="/api")

@api_bp.route("/health", methods=["GET"])
def health_check():
    """Health status endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "quizzy-backend",
        "version": "1.0.0"
    }), 200

@api_bp.route("/questions", methods=["GET"])
def get_questions():
    """Fetch, validate, normalize, and deliver quiz questions."""
    category = request.args.get("category")
    difficulty = request.args.get("difficulty")
    amount = request.args.get("amount")

    # Validate parameters
    norm_category, norm_difficulty, norm_amount = validate_quiz_params(category, difficulty, amount)

    # Fetch and normalize questions from Open Trivia DB
    base_url = current_app.config.get("TRIVIA_API_BASE_URL", "https://opentdb.com/api.php")
    timeout = current_app.config.get("TRIVIA_API_TIMEOUT", 10.0)

    delivery_questions, session_questions = fetch_questions_from_opentdb(
        category=norm_category,
        difficulty=norm_difficulty,
        amount=norm_amount,
        base_url=base_url,
        timeout=timeout,
    )

    # Create authoritative server-side quiz session
    quiz_id = f"quiz_{secrets.token_urlsafe(16)}"
    session_store = current_app.session_store

    session_store.save_session(quiz_id, {
        "config": {
            "category": delivery_questions[0]["category"] if delivery_questions else norm_category.title(),
            "difficulty": delivery_questions[0]["difficulty"] if delivery_questions else norm_difficulty.title(),
            "questionCount": norm_amount,
        },
        "questions": session_questions,
    })

    return jsonify({
        "quiz_id": quiz_id,
        "questions": delivery_questions,
        "total": len(delivery_questions),
    }), 200

@api_bp.route("/quiz/submit", methods=["POST"])
@api_bp.route("/quizzes/submit", methods=["POST"])
def submit_quiz():
    """Authoritatively score user answers against the stored quiz session."""
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"error": "Invalid request body. Expected a JSON object."}), 400

    quiz_id = payload.get("quiz_id")
    if not quiz_id or not isinstance(quiz_id, str):
        return jsonify({"error": "Field 'quiz_id' is required."}), 400

    if "answers" not in payload:
        return jsonify({"error": "Field 'answers' is required."}), 400

    answers = payload["answers"]
    if not isinstance(answers, (dict, list)):
        return jsonify({"error": "Field 'answers' must be a dictionary or a list."}), 400

    session_store = current_app.session_store
    session_data = session_store.get_session(quiz_id)

    if not session_data:
        return jsonify({"error": "Quiz session not found or expired."}), 404

    # Perform authoritative grading
    result = score_quiz(session_data, answers)
    result["quiz_id"] = quiz_id

    return jsonify(result), 200

@api_bp.errorhandler(TriviaError)
def handle_trivia_error(err: TriviaError):
    """Structured error handler for trivia-specific exceptions."""
    return jsonify({"error": err.message}), err.status_code
