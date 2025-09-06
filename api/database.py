# Nome do arquivo: api/database.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db():
    from .models import Produto  # importa modelos
    db.create_all()
