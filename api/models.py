# Nome do arquivo: api/models.py
from .database import db

class Produto(db.Model):
    __tablename__ = "produtos"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    categoria = db.Column(db.String(80), nullable=True)
    orcamento = db.Column(db.Float, nullable=True, default=0)
    valorfinal = db.Column(db.Float, nullable=True, default=0)
    quantidade = db.Column(db.Integer, nullable=True, default=1)
    link_referencia = db.Column(db.String(255), nullable=True)
    link_compra = db.Column(db.String(255), nullable=True)
    comprado = db.Column(db.Boolean, nullable=False, default=False)
    prioridade = db.Column(db.Boolean, nullable=False, default=False)
