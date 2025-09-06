// js/produtos.js — híbrido: localStorage + API (sem export, funções globais)

const API_URL = 'http://127.0.0.1:5000/api/produtos/';
const AMBIENTES = ['cozinha', 'quarto', 'sala', 'banheiro'];

let produtos = carregarLocal('produtos') || {};
AMBIENTES.forEach(a => { if (!produtos[a]) produtos[a] = []; });

function salvarProdutos() { salvarLocal('produtos', produtos); }

// -------- mapeamentos API <-> local --------
function fromApiToLocal(item) {
  return {
    _id: item.id,
    nomeproduto: item.nome ?? '',
    orcamento: item.preco ?? 0,     // mantendo seus dois campos
    valorfinal: item.preco ?? 0,    // ambos espelham 'preco' por enquanto
    quantidade: item.quantidade ?? '',
    linkreferencia: item.link_referencia ?? '',
    linkcompra: item.link_compra ?? '',
    comprado: !!item.comprado,
    prioridade: !!item.prioridade,
    editar: false
  };
}
function fromLocalToApi(p, categoria) {
  return {
    nome: p.nomeproduto,
    preco: Number(p.valorfinal || p.orcamento || 0),
    categoria,
    quantidade: p.quantidade || 1,
    link_referencia: p.linkreferencia || '',
    link_compra: p.linkcompra || '',
    comprado: !!p.comprado,
    prioridade: !!p.prioridade
  };
}

// -------- API helpers --------
async function apiListar() {
  const r = await fetch(API_URL);
  if (!r.ok) throw new Error('Falha ao buscar produtos');
  return r.json();
}
async function apiCriar(payload) {
  const r = await fetch(API_URL, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error('Falha ao criar produto');
  return r.json(); // { id }
}
async function apiRemover(id) {
  const r = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('Falha ao remover produto');
}

// -------- UI --------
function renderizarProdutos() {
  if (!window.ambienteAtual) return;
  if (!produtos[ambienteAtual]) produtos[ambienteAtual] = [];

  const lista = document.getElementById('lista');
  if (!lista) return;

  lista.innerHTML = '';
  produtos[ambienteAtual].forEach((p, index) => {
    const orc = Number(p.orcamento || 0);
    const val = Number(p.valorfinal || 0);
    const qtd = Number(p.quantidade || 0);

    lista.innerHTML += `
      <div class="item">
        <strong>${p.nomeproduto || '(sem nome)'}</strong>
        <div>Orçamento: R$${isNaN(orc)?0:orc} | Final: R$${isNaN(val)?0:val} | Qtd: ${isNaN(qtd)?0:qtd}</div>
        <div class="links">
          ${p.linkreferencia ? `<a href="${p.linkreferencia}" target="_blank">link referência</a>` : ''}
          ${p.linkcompra ? `<a href="${p.linkcompra}" target="_blank">link compra</a>` : ''}
        </div>
        <div class="acoes">
          <button onclick="marcarComprado(${index})">${p.comprado ? '✅ Comprado' : '⏳ Pendente'}</button>
          <button onclick="marcarPrioridade(${index})">${p.prioridade ? '📈 Máxima' : '📉 Mínima'}</button>
          <button onclick="editarProduto(${index})">✏️ Editar</button>
          <button onclick="excluirProduto(${index})">❌ Excluir</button>
        </div>
      </div>
    `;
  });
}

function adicionarProduto(produto) {
  if (!window.ambienteAtual) return;

  if (!produto) {
    produto = {
      nomeproduto: document.getElementById('nomeproduto')?.value || '',
      orcamento: document.getElementById('orcamento')?.value || '',
      valorfinal: document.getElementById('valorfinal')?.value || '',
      quantidade: document.getElementById('quantidade')?.value || '',
      linkreferencia: document.getElementById('linkreferencia')?.value || '',
      linkcompra: document.getElementById('linkcompra')?.value || '',
      comprado: false,
      prioridade: false,
      editar: false
    };
  }

  // 1) atualiza local p/ UI responsiva
  produtos[ambienteAtual].push(produto);
  salvarProdutos();
  renderizarProdutos();

  // 2) cria no backend
  apiCriar(fromLocalToApi(produto, ambienteAtual))
    .then(({ id }) => {
      const idx = produtos[ambienteAtual].length - 1;
      if (idx >= 0) {
        produtos[ambienteAtual][idx]._id = id;
        salvarProdutos();
      }
    })
    .catch(() => { /* se falhar, segue local */ });

  // limpar inputs
  ['nomeproduto','orcamento','valorfinal','quantidade','linkreferencia','linkcompra']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

function marcarComprado(index) {
  const p = produtos[ambienteAtual][index];
  if (!p) return;
  p.comprado = !p.comprado;
  salvarProdutos();
  renderizarProdutos();
  // TODO: PATCH na API se/quando existir
}

function marcarPrioridade(index) {
  const p = produtos[ambienteAtual][index];
  if (!p) return;
  p.prioridade = !p.prioridade;
  salvarProdutos();
  renderizarProdutos();
  // TODO: PATCH na API se/quando existir
}

function excluirProduto(index) {
  const p = produtos[ambienteAtual][index];
  produtos[ambienteAtual].splice(index, 1);
  salvarProdutos();
  renderizarProdutos();

  if (p && p._id) apiRemover(p._id).catch(() => {});
}

function editarProduto(index) {
  const p = produtos[ambienteAtual][index];
  if (!p) return;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? '' };
  set('nomeproduto', p.nomeproduto);
  set('orcamento', p.orcamento);
  set('valorfinal', p.valorfinal);
  set('quantidade', p.quantidade);
  set('linkreferencia', p.linkreferencia);
  set('linkcompra', p.linkcompra);

  produtos[ambienteAtual].splice(index, 1);
  salvarProdutos();
  renderizarProdutos();
}

// Sync inicial com a API
(async function sincronizarComApi() {
  try {
    const todos = await apiListar();
    AMBIENTES.forEach(a => produtos[a] = []);
    for (const item of todos) {
      const cat = (item.categoria || '').toLowerCase();
      if (AMBIENTES.includes(cat)) produtos[cat].push(fromApiToLocal(item));
    }
    salvarProdutos();
    renderizarProdutos();
  } catch { /* se API off, segue local */ }
})();

// expõe globais
window.renderizarProdutos = renderizarProdutos;
window.adicionarProduto  = adicionarProduto;
window.marcarComprado    = marcarComprado;
window.marcarPrioridade  = marcarPrioridade;
window.excluirProduto    = excluirProduto;
window.editarProduto     = editarProduto;
