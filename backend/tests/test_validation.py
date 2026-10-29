"""Tests for parameter validation in the trivia service."""
import pytest
from app.services import (
    validate_quiz_params,
    TriviaValidationError,
)


class TestValidateQuizParams:

    def test_valid_params_accepted(self):
        cat, diff, amt = validate_quiz_params("science", "easy", "5")
        assert cat == "science"
        assert diff == "easy"
        assert amt == 5

    def test_valid_params_case_insensitive(self):
        cat, diff, amt = validate_quiz_params("SCIENCE", "EASY", "5")
        assert cat == "science"
        assert diff == "easy"
        assert amt == 5

    def test_all_valid_categories(self):
        for category in ["science", "technology", "history", "entertainment"]:
            cat, _, _ = validate_quiz_params(category, "easy", "5")
            assert cat == category

    def test_all_valid_difficulties(self):
        for difficulty in ["easy", "medium", "hard"]:
            _, diff, _ = validate_quiz_params("science", difficulty, "10")
            assert diff == difficulty

    def test_all_valid_amounts(self):
        for amount in [5, 10, 15, 20]:
            _, _, amt = validate_quiz_params("science", "easy", str(amount))
            assert amt == amount

    def test_missing_category_raises(self):
        with pytest.raises(TriviaValidationError) as exc_info:
            validate_quiz_params(None, "easy", "5")
        assert "category" in exc_info.value.message.lower()
        assert exc_info.value.status_code == 400

    def test_empty_category_raises(self):
        with pytest.raises(TriviaValidationError):
            validate_quiz_params("", "easy", "5")

    def test_invalid_category_raises(self):
        with pytest.raises(TriviaValidationError) as exc_info:
            validate_quiz_params("geography", "easy", "5")
        assert "geography" in exc_info.value.message
        assert exc_info.value.status_code == 400

    def test_missing_difficulty_raises(self):
        with pytest.raises(TriviaValidationError) as exc_info:
            validate_quiz_params("science", None, "5")
        assert "difficulty" in exc_info.value.message.lower()

    def test_invalid_difficulty_raises(self):
        with pytest.raises(TriviaValidationError) as exc_info:
            validate_quiz_params("science", "extreme", "5")
        assert "extreme" in exc_info.value.message

    def test_missing_amount_raises(self):
        with pytest.raises(TriviaValidationError) as exc_info:
            validate_quiz_params("science", "easy", None)
        assert "amount" in exc_info.value.message.lower()

    def test_invalid_amount_not_in_allowed_set_raises(self):
        with pytest.raises(TriviaValidationError) as exc_info:
            validate_quiz_params("science", "easy", "7")
        assert "7" in exc_info.value.message

    def test_non_numeric_amount_raises(self):
        with pytest.raises(TriviaValidationError) as exc_info:
            validate_quiz_params("science", "easy", "abc")
        assert exc_info.value.status_code == 400

    def test_negative_amount_raises(self):
        with pytest.raises(TriviaValidationError):
            validate_quiz_params("science", "easy", "-5")

    def test_amount_zero_raises(self):
        with pytest.raises(TriviaValidationError):
            validate_quiz_params("science", "easy", "0")

    def test_params_with_whitespace_are_stripped(self):
        # Leading/trailing whitespace should be stripped
        cat, diff, amt = validate_quiz_params("  science  ", "  easy  ", "5")
        assert cat == "science"
        assert diff == "easy"
