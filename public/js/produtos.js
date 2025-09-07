// js/produtos.js — híbrido: localStorage + API (sem export, funções globais)

const API_URL = 'http://192.168.192.1:4000/api/produtos/';
const AMBIENTES = ['cozinha', 'quarto', 'sala', 'banheiro'];

let produtos = carregarLocal('produtos') || {};
AMBIENTES.forEach(a => { if (!produtos[a]) produtos[a] = []; });

function salvarProdutos() { salvarLocal('produtos', produtos); }

// -------- mapeamentos API <-> local --------
function fromApiToLocal(item) {
  return {
    _id: item.id,
    nomeproduto: item.nome ?? '',
    orcamento: item.orcamento ?? 0,
    valorfinal: item.valorfinal ?? 0,
    quantidade: item.quantidade ?? 1,
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
    categoria,
    orcamento: Number(p.orcamento || 0),
    valorfinal: Number(p.valorfinal || 0),
    quantidade: Number(p.quantidade || 1),
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
  const r = await fetch(`${API_URL}${id}`, { method: 'DELETE' })
  if (!r.ok) throw new Error('Falha ao remover produto');
}

// -------- UI --------
function renderizarProdutos() {
  if (!ambienteAtual) return;
  if (!produtos[ambienteAtual]) produtos[ambienteAtual] = [];

  const lista = document.getElementById("lista");
  if (!lista) return;

  lista.innerHTML = "";
  produtos[ambienteAtual].forEach((p, index) => {
    lista.innerHTML += `
      <div>
        <strong>${p.nomeproduto}</strong> - R$${p.orcamento || 0} / R$${p.valorfinal || 0}
        <strong>${p.quantidade || 1}x</strong>
        ${p.linkreferencia ? `<a href="${p.linkreferencia}" target="_blank">link referência</a>` : ""}
        ${p.linkcompra ? `<a href="${p.linkcompra}" target="_blank">link compra</a>` : ""}
        <button onclick="marcarComprado(${index})">${p.comprado ? "✅ Comprado" : "⏳ Pendente"}</button>
        <button onclick="marcarPrioridade(${index})">${p.prioridade ? "📈 Máxima" : "📉 Mínima"}</button>
        <button onclick="excluirProduto(${index})">❌ Excluir</button>
        <button onclick="editarProduto(${index})">✏️ Editar</button>
      </div>
    `;
  });

  // 🔽 atualiza o resumo
  renderizarResumo();
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

async function apiPatch(id, body) {
  await fetch(`${API_URL}${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

function marcarComprado(index) {
  const p = produtos[ambienteAtual][index];
  if (!p) return;
  p.comprado = !p.comprado;
  salvarProdutos();
  renderizarProdutos();

  if (p._id) {
    apiPatch(p._id, { comprado: p.comprado }).catch(() => {});
  }
}

function marcarPrioridade(index) {
  const p = produtos[ambienteAtual][index];
  if (!p) return;
  p.prioridade = !p.prioridade;
  salvarProdutos();
  renderizarProdutos();

  if (p._id) {
    apiPatch(p._id, { prioridade: p.prioridade }).catch(() => {});
  }
}


// expõe globais
window.renderizarProdutos = renderizarProdutos;
window.adicionarProduto  = adicionarProduto;
window.marcarComprado    = marcarComprado;
window.marcarPrioridade  = marcarPrioridade;
window.excluirProduto    = excluirProduto;
window.editarProduto     = editarProduto;

function parseNumero(v) {
  if (v === undefined || v === null || v === "") return 0;
  if (typeof v === "string") v = v.replace(".", "").replace(",", ".");
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function formatBRL(n) {
  try {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  } catch {
    return `R$ ${Number(n).toFixed(2).replace(".", ",")}`;
  }
}

function calcularResumo(ambiente) {
  const lista = produtos[ambiente] || [];
  let totalOrc = 0;       // soma de todos os orçamentos
  let totalFinal = 0;     // soma de valor final SOMENTE dos itens com final > 0
  let variacaoComprados = 0; // soma de (orcamento - valorfinal) para quem tem final > 0
  let itens = 0;
  let comprados = 0;

  for (const p of lista) {
    const orc = parseNumero(p.orcamento);
    const fin = parseNumero(p.valorfinal);

    totalOrc += orc;
    if (fin > 0) {
      totalFinal += fin;
      variacaoComprados += (orc - fin);
    }

    itens += 1;
    if (p.comprado) comprados += 1;
  }

  const saldo = totalOrc - totalFinal;
  const percent = itens > 0 ? Math.round((comprados / itens) * 100) : 0;

  return { totalOrc, totalFinal, saldo, itens, comprados, percent, variacaoComprados };
}

function renderizarResumo() {
  const wrap = document.getElementById("resumoAmbiente");
  if (!wrap || !ambienteAtual) return;

  const { totalOrc, totalFinal, saldo, itens, comprados, percent, variacaoComprados } =
    calcularResumo(ambienteAtual);

  wrap.style.display = (itens > 0) ? "block" : "none";

  const el = (id) => document.getElementById(id);
  if (el("res_orcamento")) el("res_orcamento").innerText = formatBRL(totalOrc);
  if (el("res_final")) el("res_final").innerText = formatBRL(totalFinal);
  if (el("res_saldo")) {
    el("res_saldo").innerText = formatBRL(saldo);
    el("res_saldo").style.color = saldo >= 0 ? "#2e7d32" : "#c62828";
  }
  if (el("res_itens")) el("res_itens").innerText = `${comprados} / ${itens} comprados`;
  if (el("res_percent")) el("res_percent").innerText = `${percent}%`;
  if (el("res_bar")) el("res_bar").style.width = `${percent}%`;

  // (Opcional) Mostrar variação dos itens já comprados (economia/estouro em quem tem valor final)
  let varLabel = document.getElementById("res_variacao");
  if (varLabel) {
    varLabel.innerText = (variacaoComprados >= 0 ? "Economia: " : "Estouro: ") + formatBRL(Math.abs(variacaoComprados));
    varLabel.style.color = variacaoComprados >= 0 ? "#2e7d32" : "#c62828";
  }
}

