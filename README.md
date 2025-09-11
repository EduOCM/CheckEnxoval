# 🛒 PortalEnxoval

Projeto pessoal para acompanhar e organizar o enxoval.  
Backend em **Node.js + Express + SQLite**, frontend em **HTML/JS/CSS** estático.

---

## 🔧 Estrutura

- **Backend (API Node)**  
  Pasta: `server/`  
  Banco: `server/data.db` (gerado automaticamente, ignorado pelo git)  

  Endpoints principais:
  - `GET /health`
  - `GET /api/produtos`
  - `POST /api/produtos`
  - `GET /api/produtos/:id`
  - `PUT /api/produtos/:id`
  - `DELETE /api/produtos/:id`

- **Frontend (estático)**  
  Pasta: `public/`  
  Arquivo principal: `public/index.html`

---

## 🚀 Como rodar localmente

Clone o repositório e instale as dependências do backend:

```bash
git clone https://github.com/eduocm/checkenxoval
cd checkenxoval/server

# copiar variáveis de ambiente
cp .env.example .env

# instalar dependências
npm install
```

### Rodar API (porta 3001 por padrão)

```bash
npm run dev   # modo desenvolvimento (com nodemon)
npm start     # modo produção
```

### Rodar Frontend (porta 4001)

Você tem **duas opções** para servir os arquivos estáticos da pasta `public/`:

**Opção A — Usando Python (rápido e simples, precisa de Python instalado):**
```bash
cd ../public
python -m http.server 4001
```

**Opção B — Usando Node (sem Python, precisa instalar `serve`):**
```bash
npm install -g serve
cd ../public
serve -p 4001
```

Acesse no navegador:
- API: [http://127.0.0.1:3001/health](http://127.0.0.1:3001/health)  
- Frontend: [http://127.0.0.1:4001](http://127.0.0.1:4001)

---

## 🌐 Como rodar no servidor (fluxo com **tmux**)

1. **Acessar servidor**
   ```bash
   ssh usuario@IP_server
   cd ~/Public/CheckEnxoval
   ```

2. **Atualizar código**
   ```bash
   git pull
   ```

3. **Criar/entrar em uma sessão tmux**
   ```bash
   tmux new -s portal
   ```

4. **Rodar API (janela 1 do tmux)**
   ```bash
   cd server
   npm install
   npm start
   ```

5. **Abrir nova janela no tmux (Ctrl+b depois c) e rodar o frontend (janela 2 do tmux)**

   - Se usar Python:
     ```bash
     cd ../public
     python -m http.server 4001
     ```
   - Se usar Node:
     ```bash
     cd ../public
     npx serve -p 4001
     ```

6. **Destacar do tmux sem encerrar**
   - `Ctrl+b` depois `d`

7. **Voltar depois**
   ```bash
   tmux attach -t portal
   ```

---

## 🗄️ Banco de dados
- Local: `server/data.db`
- Criado automaticamente na primeira execução
- Ignorado no Git (`.gitignore`)
