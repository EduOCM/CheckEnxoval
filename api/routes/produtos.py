# Nome do arquivo: api/routes/produtos.py
from flask import Blueprint, request, jsonify
from ..database import db
from ..models import Produto

produtos_bp = Blueprint("produtos", __name__)

def serialize(p: Produto):
    return {
        "id": p.id,
        "nome": p.nome,
        "categoria": p.categoria,
        "orcamento": p.orcamento,
        "valorfinal": p.valorfinal,
        "quantidade": p.quantidade,
        "link_referencia": p.link_referencia,
        "link_compra": p.link_compra,
        "comprado": p.comprado,
        "prioridade": p.prioridade,
    }

@produtos_bp.get("/")
def listar():
    itens = Produto.query.all()
    return jsonify([serialize(p) for p in itens])

@produtos_bp.post("/")
def criar():
    body = request.get_json(silent=True) or {}

    # compat: se vier apenas "preco", usamos como valorfinal (ou orcamento)
    valorfinal = body.get("valorfinal", body.get("preco"))
    orcamento = body.get("orcamento", 0)

    p = Produto(
        nome=body.get("nome", ""),
        categoria=body.get("categoria"),
        orcamento=float(orcamento or 0),
        valorfinal=float(valorfinal or 0),
        quantidade=int(body.get("quantidade", 1) or 1),
        link_referencia=body.get("link_referencia"),
        link_compra=body.get("link_compra"),
        comprado=bool(body.get("comprado", False)),
        prioridade=bool(body.get("prioridade", False)),
    )
    db.session.add(p)
    db.session.commit()
    return jsonify(serialize(p)), 201

@produtos_bp.get("/<int:pid>")
def obter(pid):
    p = Produto.query.get_or_404(pid)
    return jsonify(serialize(p))

@produtos_bp.patch("/<int:pid>")
def atualizar(pid):
    p = Produto.query.get_or_404(pid)
    body = request.get_json(silent=True) or {}

    for field in [
        "nome", "categoria",
        "orcamento", "valorfinal", "quantidade",
        "link_referencia", "link_compra",
        "comprado", "prioridade"
    ]:
        if field in body:
            val = body[field]
            if field in ("orcamento", "valorfinal") and val is not None:
                val = float(val)
            if field == "quantidade" and val is not None:
                val = int(val)
            if field in ("comprado", "prioridade") and val is not None:
                val = bool(val)
            setattr(p, field, val)

    db.session.commit()
    return jsonify(serialize(p))

@produtos_bp.delete("/<int:pid>")
def remover(pid):
    p = Produto.query.get_or_404(pid)
    db.session.delete(p)
    db.session.commit()
    return "", 204
