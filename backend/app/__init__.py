import logging
import os

from flask import Flask, jsonify
from flask_cors import CORS

from app.config import config_by_name
from app.routes import api_bp
from app.services import QuizSessionStore, TriviaError

def create_app(config_name: str = None) -> Flask:
    """Flask application factory."""
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)

    # --- Load configuration ---
    cfg = config_by_name.get(config_name, config_by_name["default"])
    app.config.from_object(cfg)

    # --- Logging ---
    logging.basicConfig(
        level=logging.DEBUG if app.config.get("DEBUG") else logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    # --- CORS ---
    CORS(
        app,
        origins=app.config["CORS_ORIGINS"],
        supports_credentials=False,
    )

    # --- Session store (disk-backed, not a bare global dict) ---
    app.session_store = QuizSessionStore(
        session_dir=app.config.get("SESSION_DIR"),
        ttl_seconds=app.config.get("SESSION_TTL_SECONDS", 7200),
    )

    # --- Register blueprints ---
    app.register_blueprint(api_bp)

    # --- Global error handlers ---
    @app.errorhandler(TriviaError)
    def handle_trivia_error(err: TriviaError):
        return jsonify({"error": err.message}), err.status_code

    @app.errorhandler(404)
    def not_found(_err):
        return jsonify({"error": "Endpoint not found."}), 404

    @app.errorhandler(405)
    def method_not_allowed(_err):
        return jsonify({"error": "Method not allowed."}), 405

    @app.errorhandler(500)
    def internal_error(_err):
        return jsonify({"error": "An unexpected internal server error occurred."}), 500

    return app
