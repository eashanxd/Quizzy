import logging
from typing import Any, Dict, List, Union

logger = logging.getLogger(__name__)


def calculate_performance_tier(score_percentage: int) -> str:
    """Calculate performance tier matching the frontend grading scale."""
    if score_percentage >= 90:
        return "Mastery"
    elif score_percentage >= 70:
        return "Proficient"
    elif score_percentage >= 50:
        return "Developing"
    else:
        return "Needs Review"


def score_quiz(
    session_data: Dict[str, Any],
    user_answers: Union[Dict[str, Any], List[Any]]
) -> Dict[str, Any]:
    """Authoritatively score user answers against the server-saved quiz session.
    
    Accepts user_answers as:
      - Dict of index/question-id to chosen option index: e.g. {"0": 1, "1": 3} or {"q-1": 1}
      - List of chosen option indices: e.g. [1, 3, 0, 2]
    
    Returns the authoritative QuizResult object.
    """
    questions = session_data.get("questions", [])
    config = session_data.get("config", {})
    total_questions = len(questions)

    correct_count = 0
    review_items = []

    for index, question in enumerate(questions):
        qid = question.get("id", f"q-{index + 1}")
        correct_answer_index = question.get("correctAnswerIndex", -1)

        # Resolve selectedOptionIndex from user_answers
        selected_option_index = -1

        if isinstance(user_answers, list):
            if index < len(user_answers):
                val = user_answers[index]
                if isinstance(val, (int, float)) and not isinstance(val, bool):
                    selected_option_index = int(val)
        elif isinstance(user_answers, dict):
            # Check integer index, string index, or question ID
            val = None
            if index in user_answers:
                val = user_answers[index]
            elif str(index) in user_answers:
                val = user_answers[str(index)]
            elif qid in user_answers:
                val = user_answers[qid]

            if val is not None and isinstance(val, (int, float)) and not isinstance(val, bool):
                selected_option_index = int(val)

        is_correct = (selected_option_index == correct_answer_index) and (selected_option_index != -1)
        if is_correct:
            correct_count += 1

        review_items.append({
            "question": question,
            "selectedOptionIndex": selected_option_index,
            "isCorrect": is_correct,
        })

    score_percentage = round((correct_count / total_questions) * 100) if total_questions > 0 else 0
    performance_tier = calculate_performance_tier(score_percentage)

    return {
        "config": config,
        "totalQuestions": total_questions,
        "correctCount": correct_count,
        "scorePercentage": score_percentage,
        "performanceTier": performance_tier,
        "reviewItems": review_items,
    }
