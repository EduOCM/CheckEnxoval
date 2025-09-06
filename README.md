Será um projeto pessoal, para melhorar o acompanhamento do Enxoval


# PortalEnxoval

## Frontend
- Pasta: `public/`
- Abrir `public/index.html` com um servidor estático local

## Backend (Flask + SQLite)
- Pasta: `api/`
- Requisitos: `python -m venv .venv && source .venv/bin/activate && pip install -r api/requirements.txt`
- Rodar: `python -m api.app`
- Endpoints:
  - `GET /api/health`
  - `GET /api/produtos/`
  - `POST /api/produtos/`
  - `GET /api/produtos/{id}`
  - `DELETE /api/produtos/{id}`

## Banco
- Arquivo: `api/instance/produtos.db` (gerado automaticamente)
- Ignorado pelo git