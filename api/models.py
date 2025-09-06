# Nome do arquivo: api/models.py
from .database import db

class Produto(db.Model):
    __tablename__ = "produtos"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    preco = db.Column(db.Float, nullable=False, default=0)
    categoria = db.Column(db.String(80), nullable=True)
