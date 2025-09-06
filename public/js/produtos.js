// Nome do arquivo: public/js/produtos.js
// onde colar: substituir ou adicionar no seu arquivo atual

const API_URL = 'http://127.0.0.1:5000/api/produtos'

export async function listarProdutos() {
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error('Falha ao buscar produtos')
  return await res.json()
}

export async function criarProduto({ nome, preco, categoria }) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, preco, categoria })
  })
  if (!res.ok) throw new Error('Falha ao criar produto')
  return await res.json()
}

export async function removerProduto(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Falha ao remover produto')
}
