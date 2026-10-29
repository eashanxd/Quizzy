"""Tests for response normalization from Open Trivia DB format."""
import pytest
from unittest.mock import MagicMock, patch

from app.services import (
    TriviaInsufficientQuestionsError,
    TriviaMalformedResponseError,
    TriviaRateLimitError,
    TriviaTimeoutError,
    TriviaConnectionError,
    TriviaUpstreamError,
    fetch_questions_from_opentdb,
)
from app.services.trivia_service import normalize_questions, clean_text


class TestCleanText:

    def test_decodes_html_entities(self):
        assert clean_text("Tom &amp; Jerry") == "Tom & Jerry"
        assert clean_text("&lt;em&gt;Hello&lt;/em&gt;") == "<em>Hello</em>"

    def test_strips_whitespace(self):
        assert clean_text("  hello  ") == "hello"

    def test_empty_string_returns_empty(self):
        assert clean_text("") == ""

    def test_plain_text_unchanged(self):
        assert clean_text("Mercury") == "Mercury"

    def test_double_encoded_entities(self):
        result = clean_text("&amp;lt;em&amp;gt;")
        # Should not contain raw &amp; after cleaning
        assert "&amp;" not in result


class TestNormalizeQuestions:

    def _make_raw_item(self, correct="Answer A", incorrect=None):
        return {
            "type": "multiple",
            "difficulty": "easy",
            "category": "Science & Nature",
            "question": "Test question?",
            "correct_answer": correct,
            "incorrect_answers": incorrect or ["Answer B", "Answer C", "Answer D"],
        }

    def test_delivery_questions_omit_correct_answer_index(self):
        raw = [self._make_raw_item()]
        delivery, _ = normalize_questions(raw, "science", "easy")
        assert "correctAnswerIndex" not in delivery[0]

    def test_session_questions_include_correct_answer_index(self):
        raw = [self._make_raw_item()]
        _, session = normalize_questions(raw, "science", "easy")
        assert "correctAnswerIndex" in session[0]
        assert isinstance(session[0]["correctAnswerIndex"], int)

    def test_correct_answer_in_options(self):
        raw = [self._make_raw_item(correct="Water")]
        delivery, session = normalize_questions(raw, "science", "easy")
        idx = session[0]["correctAnswerIndex"]
        assert delivery[0]["options"][idx] == "Water"
        assert session[0]["options"][idx] == "Water"

    def test_four_options_always_returned(self):
        raw = [self._make_raw_item()]
        delivery, session = normalize_questions(raw, "science", "easy")
        assert len(delivery[0]["options"]) == 4
        assert len(session[0]["options"]) == 4

    def test_category_display_name_is_canonical(self):
        raw = [self._make_raw_item()]
        delivery, _ = normalize_questions(raw, "science", "easy")
        assert delivery[0]["category"] == "Science"

    def test_difficulty_display_name_is_capitalized(self):
        raw = [self._make_raw_item()]
        delivery, _ = normalize_questions(raw, "science", "easy")
        assert delivery[0]["difficulty"] == "Easy"

    def test_question_ids_are_sequential(self):
        raw = [self._make_raw_item(), self._make_raw_item()]
        delivery, _ = normalize_questions(raw, "science", "easy")
        assert delivery[0]["id"] == "q-1"
        assert delivery[1]["id"] == "q-2"

    def test_html_entities_decoded_in_questions(self):
        raw = [{
            "type": "multiple",
            "difficulty": "easy",
            "category": "Science &amp; Nature",
            "question": "What is H&amp;sub&gt;2&amp;/sub&gt;O?",
            "correct_answer": "Water",
            "incorrect_answers": ["Salt", "Sugar", "Oil"],
        }]
        delivery, _ = normalize_questions(raw, "science", "easy")
        # HTML entities should be decoded
        assert "&amp;" not in delivery[0]["question"]

    def test_delivery_and_session_questions_same_length(self):
        raw = [self._make_raw_item() for _ in range(5)]
        delivery, session = normalize_questions(raw, "history", "medium")
        assert len(delivery) == len(session) == 5

    def test_technology_display_name(self):
        raw = [self._make_raw_item()]
        delivery, _ = normalize_questions(raw, "technology", "hard")
        assert delivery[0]["category"] == "Technology"

    def test_entertainment_display_name(self):
        raw = [self._make_raw_item()]
        delivery, _ = normalize_questions(raw, "entertainment", "medium")
        assert delivery[0]["category"] == "Entertainment"


class TestFetchQuestionsFromOpentdb:
    """Test fetch_questions_from_opentdb with mocked HTTP responses."""

    BASE_URL = "https://opentdb.com/api.php"

    def _make_mock_response(self, json_data, status_code=200):
        mock_resp = MagicMock()
        mock_resp.status_code = status_code
        mock_resp.json.return_value = json_data
        return mock_resp

    def _make_valid_response(self, count=5):
        return {
            "response_code": 0,
            "results": [
                {
                    "type": "multiple",
                    "difficulty": "easy",
                    "category": "Science &amp; Nature",
                    "question": f"Question {i + 1}?",
                    "correct_answer": f"Answer {i + 1}",
                    "incorrect_answers": [f"Wrong A{i}", f"Wrong B{i}", f"Wrong C{i}"],
                }
                for i in range(count)
            ],
        }

    def test_success_returns_correct_counts(self):
        mock_session = MagicMock()
        mock_session.get.return_value = self._make_mock_response(self._make_valid_response(5))
        delivery, session = fetch_questions_from_opentdb(
            "science", "easy", 5, session=mock_session
        )
        assert len(delivery) == 5
        assert len(session) == 5

    def test_no_correct_answers_in_delivery(self):
        mock_session = MagicMock()
        mock_session.get.return_value = self._make_mock_response(self._make_valid_response(5))
        delivery, _ = fetch_questions_from_opentdb(
            "science", "easy", 5, session=mock_session
        )
        for q in delivery:
            assert "correctAnswerIndex" not in q

    def test_correct_answers_in_session(self):
        mock_session = MagicMock()
        mock_session.get.return_value = self._make_mock_response(self._make_valid_response(5))
        _, session_qs = fetch_questions_from_opentdb(
            "science", "easy", 5, session=mock_session
        )
        for q in session_qs:
            assert "correctAnswerIndex" in q
            idx = q["correctAnswerIndex"]
            assert 0 <= idx < 4

    def test_response_code_1_raises_insufficient_questions(self):
        mock_session = MagicMock()
        mock_session.get.return_value = self._make_mock_response({"response_code": 1, "results": []})
        with pytest.raises(TriviaInsufficientQuestionsError):
            fetch_questions_from_opentdb("history", "hard", 20, session=mock_session)

    def test_response_code_2_raises_upstream_error(self):
        mock_session = MagicMock()
        mock_session.get.return_value = self._make_mock_response({"response_code": 2, "results": []})
        with pytest.raises(TriviaUpstreamError):
            fetch_questions_from_opentdb("science", "easy", 5, session=mock_session)

    def test_response_code_5_raises_rate_limit(self):
        mock_session = MagicMock()
        mock_session.get.return_value = self._make_mock_response({"response_code": 5, "results": []})
        with pytest.raises(TriviaRateLimitError):
            fetch_questions_from_opentdb("science", "easy", 5, session=mock_session)

    def test_http_429_raises_rate_limit(self):
        mock_session = MagicMock()
        mock_session.get.return_value = self._make_mock_response({}, status_code=429)
        with pytest.raises(TriviaRateLimitError):
            fetch_questions_from_opentdb("science", "easy", 5, session=mock_session)

    def test_http_500_raises_upstream_error(self):
        mock_session = MagicMock()
        mock_session.get.return_value = self._make_mock_response({}, status_code=500)
        with pytest.raises(TriviaUpstreamError):
            fetch_questions_from_opentdb("science", "easy", 5, session=mock_session)

    def test_timeout_raises_trivia_timeout_error(self):
        import requests as req_lib
        mock_session = MagicMock()
        mock_session.get.side_effect = req_lib.exceptions.Timeout("timed out")
        with pytest.raises(TriviaTimeoutError):
            fetch_questions_from_opentdb("science", "easy", 5, session=mock_session)

    def test_connection_error_raises_trivia_connection_error(self):
        import requests as req_lib
        mock_session = MagicMock()
        mock_session.get.side_effect = req_lib.exceptions.ConnectionError("refused")
        with pytest.raises(TriviaConnectionError):
            fetch_questions_from_opentdb("science", "easy", 5, session=mock_session)

    def test_malformed_json_raises_malformed_response_error(self):
        mock_session = MagicMock()
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.side_effect = ValueError("not json")
        mock_session.get.return_value = mock_resp
        with pytest.raises(TriviaMalformedResponseError):
            fetch_questions_from_opentdb("science", "easy", 5, session=mock_session)

    def test_missing_results_key_raises_malformed(self):
        mock_session = MagicMock()
        mock_session.get.return_value = self._make_mock_response({"response_code": 0})
        with pytest.raises(TriviaMalformedResponseError):
            fetch_questions_from_opentdb("science", "easy", 5, session=mock_session)

    def test_fewer_results_than_requested_raises_insufficient(self):
        mock_session = MagicMock()
        # Only 2 results returned when 5 were requested
        mock_session.get.return_value = self._make_mock_response(self._make_valid_response(2))
        with pytest.raises(TriviaInsufficientQuestionsError):
            fetch_questions_from_opentdb("science", "easy", 5, session=mock_session)

    def test_correct_category_id_used_in_request(self):
        from app.services.trivia_service import CATEGORY_MAPPING
        mock_session = MagicMock()
        mock_session.get.return_value = self._make_mock_response(self._make_valid_response(5))
        fetch_questions_from_opentdb("history", "medium", 5, session=mock_session)
        call_kwargs = mock_session.get.call_args
        params = call_kwargs[1]["params"] if "params" in call_kwargs[1] else call_kwargs[0][1]
        assert params["category"] == CATEGORY_MAPPING["history"]
