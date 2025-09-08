# 🛒 PortalEnxoval

Projeto pessoal para acompanhar e organizar o enxoval.  
Backend em **Flask + SQLite**, frontend em **HTML/JS/CSS** estático.

---

## 🔧 Estrutura
- **Backend (API Flask)**  
  Pasta: `api/`  
  Banco: `api/instance/produtos.db` (gerado automaticamente, ignorado pelo git)  

  Endpoints principais:
  - `GET /api/health`
  - `GET /api/produtos/`
  - `POST /api/produtos/`
  - `GET /api/produtos/{id}`
  - `PATCH /api/produtos/{id}`
  - `DELETE /api/produtos/{id}`

- **Frontend (estático)**  
  Pasta: `public/`  
  Arquivo principal: `public/index.html`  

---

## 🚀 Como rodar localmente

Clonar o repositório e instalar dependências:

```bash
git clone https://github.com/eduocm/checkenxoval
cd checkenxoval

# criar ambiente virtual
python -m venv .venv
source .venv/bin/activate

# instalar dependências
pip install -r api/requirements.txt
```

### Rodar API (porta 5000 por padrão)
```bash
python -m api.app
```

### Rodar Frontend (porta 4001 por exemplo)
```bash
cd public
python -m http.server 4001
```

Acesse no navegador:
- API: [http://127.0.0.1:5000/api/health](http://127.0.0.1:5000/api/health)  
- Frontend: [http://127.0.0.1:4001](http://127.0.0.1:4001)  

---

## 🌐 Como rodar no servidor (meu fluxo pessoal com **tmux**)

1. **Acessar servidor**
   ```bash
   ssh nameusaer@IP_server
   cd Public/CheckEnxoval
   ```

2. **Verificar se tmux está rodando**
   ```bash
   tmux ls
   ```
   Exemplo:
   ```
   0: 1 windows (created ...)
   ```

3. **Entrar na sessão**
   ```bash
   tmux attach -t 0
   ```

4. **Parar processos atuais (Ctrl+C)**

5. **Atualizar código**
   ```bash
   git pull
   ```

6. **Rodar API**
   ```bash
   python -m venv .venv && source .venv/bin/activate && pip install -r api/requirements.txt
   python -m api.app
   ```

7. **Abrir nova janela no tmux (Ctrl+B, depois %)**  
   Nessa nova janela:
   ```bash
   cd Public/CheckEnxoval/public
   python -m http.server 4001
   ```

8. **Desconectar do tmux sem matar processos**
   - `Ctrl+B` depois `D`

---

## 🗄️ Banco de dados
- Local: `api/instance/produtos.db`
- Criado automaticamente na primeira execução.
- Ignorado no Git (`.gitignore`).
