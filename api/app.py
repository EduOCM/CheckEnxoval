from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Configura o Flask e o banco de dados
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///produtos.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Cria o modelo (a classe) que representa a tabela de produtos
class Produto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nomeproduto = db.Column(db.String(100))
    orcamento = db.Column(db.Float)
    valorfinal = db.Column(db.Float)
    quantidade = db.Column(db.Integer)
    linkreferencia = db.Column(db.String(500))
    linkcompra = db.Column(db.String(500))
    comprado = db.Column(db.Boolean)
    prioridade = db.Column(db.Boolean)
    

    def __repr__(self):
        return f'<Produto {self.nomeproduto}>'

# Cria as tabelas no banco de dados
with app.app_context():
    db.create_all()

# Exemplo de como usar em uma rota
@app.route('/')
def index():
    # Aqui a tabela já existe e você pode inserir dados
    novo_produto = Produto(
        nomeproduto='Laptop',
        orcamento=2500.00,
        valorfinal=2300.00,
        quantidade=1,
        linkreferencia='http://referencia.com',
        linkcompra='http://compra.com',
        comprado=False,
        prioridade=False,
    )
    db.session.add(novo_produto)
    db.session.commit()
    return "Tabela criada e um produto adicionado!"

if __name__ == '__main__':
    app.run(debug=True)