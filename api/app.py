from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import func

# --- Config ---
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///produtos.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JSON_SORT_KEYS"] = False  # mantém ordem dos campos
    db.init_app(app)
    CORS(app)  # libera para o front no localhost

    with app.app_context():
        db.create_all()

    register_error_handlers(app)
    register_routes(app)
    return app

# --- Modelo ---
class Produto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nomeproduto = db.Column(db.String(100), nullable=False)
    ambiente = db.Column(db.String(50), nullable=True)  # cozinha/quarto/sala/banheiro
    orcamento = db.Column(db.Float, default=0.0)
    valorfinal = db.Column(db.Float, default=0.0)
    quantidade = db.Column(db.Integer, default=1)
    linkreferencia = db.Column(db.String(500), default="")
    linkcompra = db.Column(db.String(500), default="")
    comprado = db.Column(db.Boolean, default=False)
    prioridade = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "nomeproduto": self.nomeproduto,
            "ambiente": self.ambiente,
            "orcamento": self.orcamento,
            "valorfinal": self.valorfinal,
            "quantidade": self.quantidade,
            "linkreferencia": self.linkreferencia,
            "linkcompra": self.linkcompra,
            "comprado": self.comprado,
            "prioridade": self.prioridade,
        }

# --- Helpers de resposta/erros ---
def error(message, status=400, extra=None):
    payload = {"error": message}
    if extra:
        payload.update(extra)
    return jsonify(payload), status

def register_error_handlers(app):
    @app.errorhandler(404)
    def handle_404(_):
        return error("Recurso não encontrado", 404)

    @app.errorhandler(405)
    def handle_405(_):
        return error("Método não permitido", 405)

    @app.errorhandler(500)
    def handle_500(e):
        return error("Erro interno do servidor", 500, {"detail": str(e)})

# --- Validação simples ---
REQUIRED_FIELDS = ["nomeproduto"]
ALLOWED_FIELDS = {
    "nomeproduto", "ambiente", "orcamento", "valorfinal", "quantidade",
    "linkreferencia", "linkcompra", "comprado", "prioridade"
}

def parse_json():
    if not request.is_json:
        return None, error("Envie JSON no corpo da requisição (Content-Type: application/json).", 415)
    return request.get_json(silent=True) or {}, None

def clean_payload(data, partial=False):
    # Mantém apenas campos permitidos; checa obrigatórios quando não-partial
    cleaned = {k: v for k, v in data.items() if k in ALLOWED_FIELDS}
    if not partial:
        missing = [f for f in REQUIRED_FIELDS if not cleaned.get(f)]
        if missing:
            return None, error(f"Campos obrigatórios ausentes: {', '.join(missing)}", 422)
    return cleaned, None

# --- Rotas ---
def register_routes(app):
    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    # LISTAR com filtros e paginação
    @app.get("/api/produtos")
    def list_produtos():
        q = Produto.query

        # filtros opcionais
        ambiente = request.args.get("ambiente")
        comprado = request.args.get("comprado")
        prioridade = request.args.get("prioridade")
        search = request.args.get("q")

        if ambiente:
            q = q.filter(Produto.ambiente == ambiente)
        if comprado is not None:
            if comprado.lower() in ("true", "1"):
                q = q.filter(Produto.comprado.is_(True))
            elif comprado.lower() in ("false", "0"):
                q = q.filter(Produto.comprado.is_(False))
        if prioridade is not None:
            if prioridade.lower() in ("true", "1"):
                q = q.filter(Produto.prioridade.is_(True))
            elif prioridade.lower() in ("false", "0"):
                q = q.filter(Produto.prioridade.is_(False))
        if search:
            like = f"%{search}%"
            q = q.filter(func.lower(Produto.nomeproduto).like(func.lower(like)))

        # paginação simples
        page = max(int(request.args.get("page", 1)), 1)
        per_page = min(max(int(request.args.get("per_page", 20)), 1), 100)
        pagination = q.order_by(Produto.id.desc()).paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            "items": [p.to_dict() for p in pagination.items],
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "pages": pagination.pages,
        })

    # CRIAR
    @app.post("/api/produtos")
    def create_produto():
        data, err = parse_json()
        if err: return err
        cleaned, err = clean_payload(data, partial=False)
        if err: return err

        produto = Produto(**cleaned)
        db.session.add(produto)
        db.session.commit()
        return jsonify(produto.to_dict()), 201

    # LER por id
    @app.get("/api/produtos/<int:produto_id>")
    def get_produto(produto_id):
        produto = Produto.query.get_or_404(produto_id)
        return jsonify(produto.to_dict())

    # ATUALIZAR (replace)
    @app.put("/api/produtos/<int:produto_id>")
    def update_produto(produto_id):
        Produto.query.get_or_404(produto_id)  # garante 404 se não existe
        data, err = parse_json()
        if err: return err
        cleaned, err = clean_payload(data, partial=False)
        if err: return err

        Produto.query.filter_by(id=produto_id).update(cleaned)
        db.session.commit()
        produto = Produto.query.get(produto_id)
        return jsonify(produto.to_dict())

    # ATUALIZAÇÃO PARCIAL
    @app.patch("/api/produtos/<int:produto_id>")
    def patch_produto(produto_id):
        produto = Produto.query.get_or_404(produto_id)
        data, err = parse_json()
        if err: return err
        cleaned, _ = clean_payload(data, partial=True)

        for k, v in cleaned.items():
            setattr(produto, k, v)
        db.session.commit()
        return jsonify(produto.to_dict())

    # DELETAR
    @app.delete("/api/produtos/<int:produto_id>")
    def delete_produto(produto_id):
        produto = Produto.query.get_or_404(produto_id)
        db.session.delete(produto)
        db.session.commit()
        return jsonify({"deleted": True, "id": produto_id})

    # Ações sem payload (mais semânticas pro front)
    @app.patch("/api/produtos/<int:produto_id>/toggle-comprado")
    def toggle_comprado(produto_id):
        produto = Produto.query.get_or_404(produto_id)
        produto.comprado = not produto.comprado
        db.session.commit()
        return jsonify(produto.to_dict())

    @app.patch("/api/produtos/<int:produto_id>/toggle-prioridade")
    def toggle_prioridade(produto_id):
        produto = Produto.query.get_or_404(produto_id)
        produto.prioridade = not produto.prioridade
        db.session.commit()
        return jsonify(produto.to_dict())

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
