"""Tests for the server-side scoring service."""
import pytest
from app.services import score_quiz, calculate_performance_tier


class TestCalculatePerformanceTier:

    def test_90_and_above_is_mastery(self):
        assert calculate_performance_tier(90) == "Mastery"
        assert calculate_performance_tier(100) == "Mastery"
        assert calculate_performance_tier(95) == "Mastery"

    def test_70_to_89_is_proficient(self):
        assert calculate_performance_tier(70) == "Proficient"
        assert calculate_performance_tier(89) == "Proficient"
        assert calculate_performance_tier(75) == "Proficient"

    def test_50_to_69_is_developing(self):
        assert calculate_performance_tier(50) == "Developing"
        assert calculate_performance_tier(69) == "Developing"
        assert calculate_performance_tier(55) == "Developing"

    def test_below_50_is_needs_review(self):
        assert calculate_performance_tier(0) == "Needs Review"
        assert calculate_performance_tier(49) == "Needs Review"
        assert calculate_performance_tier(25) == "Needs Review"


class TestScoreQuiz:

    def _make_session(self, questions):
        return {
            "config": {
                "category": "Science",
                "difficulty": "Easy",
                "questionCount": len(questions),
            },
            "questions": questions,
        }

    def _make_question(self, qid, correct_index=0):
        return {
            "id": qid,
            "category": "Science",
            "difficulty": "Easy",
            "question": "Test question?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswerIndex": correct_index,
            "explanation": "The correct answer is: Option A",
        }

    def test_all_correct_dict_format(self):
        questions = [self._make_question(f"q-{i+1}", i % 4) for i in range(5)]
        session_data = self._make_session(questions)
        answers = {str(i): i % 4 for i in range(5)}
        result = score_quiz(session_data, answers)
        assert result["correctCount"] == 5
        assert result["scorePercentage"] == 100
        assert result["performanceTier"] == "Mastery"

    def test_all_wrong_dict_format(self):
        questions = [self._make_question(f"q-{i+1}", 0) for i in range(4)]
        session_data = self._make_session(questions)
        answers = {"0": 1, "1": 2, "2": 3, "3": 1}  # all wrong (correct is 0)
        result = score_quiz(session_data, answers)
        assert result["correctCount"] == 0
        assert result["scorePercentage"] == 0
        assert result["performanceTier"] == "Needs Review"

    def test_all_correct_list_format(self):
        questions = [self._make_question(f"q-{i+1}", 1) for i in range(10)]
        session_data = self._make_session(questions)
        answers = [1] * 10  # all correct
        result = score_quiz(session_data, answers)
        assert result["correctCount"] == 10
        assert result["scorePercentage"] == 100

    def test_partial_score_list(self):
        questions = [self._make_question(f"q-{i+1}", 0) for i in range(4)]
        session_data = self._make_session(questions)
        answers = [0, 0, 1, 1]  # 2 correct
        result = score_quiz(session_data, answers)
        assert result["correctCount"] == 2
        assert result["scorePercentage"] == 50
        assert result["performanceTier"] == "Developing"

    def test_answers_by_question_id(self):
        questions = [
            self._make_question("q-1", correct_index=2),
            self._make_question("q-2", correct_index=3),
        ]
        session_data = self._make_session(questions)
        answers = {"q-1": 2, "q-2": 3}  # both correct
        result = score_quiz(session_data, answers)
        assert result["correctCount"] == 2

    def test_no_answers_gives_zero_score(self):
        questions = [self._make_question(f"q-{i+1}", 0) for i in range(5)]
        session_data = self._make_session(questions)
        result = score_quiz(session_data, {})
        assert result["correctCount"] == 0
        assert result["scorePercentage"] == 0

    def test_empty_question_list_returns_zero(self):
        session_data = self._make_session([])
        result = score_quiz(session_data, {})
        assert result["correctCount"] == 0
        assert result["scorePercentage"] == 0
        assert result["totalQuestions"] == 0

    def test_result_contains_review_items(self):
        questions = [self._make_question("q-1", 0)]
        session_data = self._make_session(questions)
        result = score_quiz(session_data, {"0": 0})
        assert "reviewItems" in result
        assert len(result["reviewItems"]) == 1
        review = result["reviewItems"][0]
        assert review["isCorrect"] is True
        assert review["selectedOptionIndex"] == 0

    def test_review_item_correct_false_for_wrong_answer(self):
        questions = [self._make_question("q-1", correct_index=0)]
        session_data = self._make_session(questions)
        result = score_quiz(session_data, {"0": 2})  # wrong answer
        review = result["reviewItems"][0]
        assert review["isCorrect"] is False
        assert review["selectedOptionIndex"] == 2

    def test_unanswered_question_marked_incorrect(self):
        questions = [self._make_question("q-1", 0), self._make_question("q-2", 1)]
        session_data = self._make_session(questions)
        answers = {"0": 0}  # only q-1 answered
        result = score_quiz(session_data, answers)
        assert result["correctCount"] == 1
        review_q2 = result["reviewItems"][1]
        assert review_q2["isCorrect"] is False
        assert review_q2["selectedOptionIndex"] == -1

    def test_config_is_passed_through(self):
        questions = [self._make_question("q-1", 0)]
        session_data = self._make_session(questions)
        result = score_quiz(session_data, {"0": 0})
        assert result["config"]["category"] == "Science"
        assert result["config"]["questionCount"] == 1

    def test_proficient_tier_at_70_percent(self):
        questions = [self._make_question(f"q-{i+1}", 0) for i in range(10)]
        session_data = self._make_session(questions)
        answers = {str(i): 0 for i in range(7)}  # 7/10 correct
        result = score_quiz(session_data, answers)
        assert result["scorePercentage"] == 70
        assert result["performanceTier"] == "Proficient"
