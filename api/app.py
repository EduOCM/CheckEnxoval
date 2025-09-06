# Nome do arquivo: api/app.py
from flask import Flask
from flask_cors import CORS
from .database import db, init_db
from .routes.produtos import produtos_bp

def create_app():
    app = Flask(__name__, instance_relative_config=True)

    # Banco ficará em api/instance/produtos.db
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///produtos.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # CORS liberado para seu frontend local
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_app(app)
    with app.app_context():
        init_db()

    app.register_blueprint(produtos_bp, url_prefix="/api/produtos")

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    return app

# Execução direta: python -m api.app
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
