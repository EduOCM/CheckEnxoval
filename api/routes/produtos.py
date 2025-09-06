# Nome do arquivo: api/routes/produtos.py
from flask import Blueprint, request, jsonify
from ..database import db
from ..models import Produto

produtos_bp = Blueprint("produtos", __name__)

@produtos_bp.get("/")
def listar():
    itens = Produto.query.all()
    data = [{"id": p.id, "nome": p.nome, "preco": p.preco, "categoria": p.categoria} for p in itens]
    return jsonify(data)

@produtos_bp.post("/")
def criar():
    body = request.get_json(silent=True) or {}
    p = Produto(
        nome=body.get("nome", ""),
        preco=float(body.get("preco", 0)),
        categoria=body.get("categoria")
    )
    db.session.add(p)
    db.session.commit()
    return jsonify({"id": p.id}), 201

@produtos_bp.get("/<int:pid>")
def obter(pid):
    p = Produto.query.get_or_404(pid)
    return jsonify({"id": p.id, "nome": p.nome, "preco": p.preco, "categoria": p.categoria})

@produtos_bp.delete("/<int:pid>")
def remover(pid):
    p = Produto.query.get_or_404(pid)
    db.session.delete(p)
    db.session.commit()
    return "", 204
