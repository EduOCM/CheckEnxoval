// public/js/produtos.js — híbrido: localStorage + API (funções globais)

// --- Config da API (usa o mesmo host do front, com /api) ---
const API_ORIGIN = `${location.protocol}//${location.hostname}:4000`;
const API_URL    = `${API_ORIGIN}/api/produtos/`;

// --- Ambientes fixos (pode evoluir p/ dinâmico depois) ---
const AMBIENTES = ['cozinha', 'quarto', 'sala', 'banheiro'];

// --- Estado local (cache em localStorage p/ UX rápida) ---
let produtos = carregarLocal('produtos') || {};
AMBIENTES.forEach(a => { if (!produtos[a]) produtos[a] = []; });
function salvarProdutos() { salvarLocal('produtos', produtos); }

let filtroAtual = 'todos'; // 'todos' | 'comprados' | 'pendentes' | 'prioridade'
let queryAtual = '';

function setFiltro(novo, btn) {
  filtroAtual = novo;
  // alterna destaque visual dos botões
  document.querySelectorAll('.toolbar .filtros .flt').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderizarProdutos();
}
function setQuery(q) {
  queryAtual = (q || '').trim().toLowerCase();
  renderizarProdutos();
}
window.setFiltro = setFiltro;
window.setQuery = setQuery;

function passaFiltro(p) {
  if (filtroAtual === 'comprados' && !p.comprado) return false;
  if (filtroAtual === 'pendentes' && p.comprado) return false;
  if (filtroAtual === 'prioridade' && !p.prioridade) return false;
  if (queryAtual) {
    const texto = [
      p.nomeproduto, p.linkreferencia, p.linkcompra
    ].filter(Boolean).join(' ').toLowerCase();
    if (!texto.includes(queryAtual)) return false;
  }
  return true;
}


// ================== Utils ==================
function parseNumero(raw) {
  if (raw === undefined || raw === null) return 0;
  let s = String(raw).trim();

  // remove R$, espaços e tudo que não for dígito, ponto ou vírgula
  s = s.replace(/\s/g, "").replace(/R\$/i, "");

  // se não tem ponto nem vírgula, é inteiro
  if (!/[.,]/.test(s)) return Number(s) || 0;

  // acha última ocorrência de . ou ,
  const lastDot = s.lastIndexOf(".");
  const lastCom = s.lastIndexOf(",");

  // define qual é o separador decimal (o que aparece por último)
  let dec = lastDot > lastCom ? "." : ",";

  // remove TODOS os separadores de milhar (o "outro" símbolo)
  const thou = dec === "." ? "," : ".";
  s = s.split(thou).join("");

  // troca o separador decimal por ponto
  if (dec === ",") s = s.replace(/,/g, ".");

  const n = Number(s);
  return isNaN(n) ? 0 : n;
}

function formatBRL(n) {
  try { return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
  catch { return `R$ ${Number(n).toFixed(2).replace(".", ",")}`; }
}

// ================== Mapeamentos API <-> Local ==================
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
    orcamento: parseNumero(p.orcamento),
    valorfinal: parseNumero(p.valorfinal),
    quantidade: parseNumero(p.quantidade) || 1,
    link_referencia: p.linkreferencia || '',
    link_compra: p.linkcompra || '',
    comprado: !!p.comprado,
    prioridade: !!p.prioridade
  };
}

// ================== API helpers ==================
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
  return r.json(); // retorna o objeto criado (com id)
}
async function apiRemover(id) {
  const r = await fetch(`${API_URL}${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error('Falha ao remover produto');
}
async function apiPatch(id, body) {
  const r = await fetch(`${API_URL}${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error('Falha ao atualizar produto');
  return r.json();
}

// ================== Resumo e Progresso ==================
function calcularResumo(ambiente) {
  const lista = produtos[ambiente] || [];
  let totalOrc = 0;           // soma de todos os orçamentos
  let totalFinal = 0;         // soma de valor final SOMENTE dos itens com final > 0
  let variacaoComprados = 0;  // soma de (orcamento - valorfinal) para quem tem final > 0
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

  // (Opcional) Mostrar variação nos comprados (economia/estouro somente dos itens com valor final)
  let varLabel = document.getElementById("res_variacao");
  if (varLabel) {
    varLabel.innerText = (variacaoComprados >= 0 ? "Economia: " : "Estouro: ")
                          + formatBRL(Math.abs(variacaoComprados));
    varLabel.style.color = variacaoComprados >= 0 ? "#2e7d32" : "#c62828";
  }
}

// ================== UI (lista) ==================
function renderizarProdutos() {
  if (!window.ambienteAtual) return;
  if (!produtos[ambienteAtual]) produtos[ambienteAtual] = [];

  const lista = document.getElementById('lista');
  if (!lista) return;

    lista.innerHTML = '';

  const visiveis = (produtos[ambienteAtual] || []).filter(passaFiltro);

  visiveis.forEach((p) => {
    const orc = parseNumero(p.orcamento);
    const val = parseNumero(p.valorfinal);
    const qtd = parseNumero(p.quantidade) || 1;

    // índice real no array original (para ações funcionarem mesmo filtrado)
    const indexReal = produtos[ambienteAtual].indexOf(p);

    // ids únicos para inputs quando estiver editando
    const idp = `i${ambienteAtual}-${indexReal}`;

    // bloco de visualização (não editando)
    const viewBlock = `
      <strong>${p.nomeproduto || '(sem nome)'}</strong>
      ${p.prioridade ? '<span class="badge prio">★ Prioridade</span>' : ''}
      <div>Orçamento: ${formatBRL(orc)} | Final: ${formatBRL(val)} | Qtd: ${qtd}x</div>
      <div class="links">
        ${p.linkreferencia ? `<a href="${p.linkreferencia}" target="_blank">link referência</a>` : ''}
        ${p.linkcompra ? `<a href="${p.linkcompra}" target="_blank">link compra</a>` : ''}
      </div>
    `;

    // bloco de edição inline
    const editBlock = `
      <div class="edit-row">
        <input id="${idp}-nome" type="text" placeholder="Nome" value="${p.nomeproduto ?? ''}">
        <input id="${idp}-orc"  type="text" inputmode="decimal" placeholder="Orçamento" value="${p.orcamento ?? ''}">
        <input id="${idp}-fin"  type="text" inputmode="decimal" placeholder="Valor final" value="${p.valorfinal ?? ''}">
        <input id="${idp}-qtd"  type="number" min="1" placeholder="Qtd" value="${qtd}">
        <input id="${idp}-ref"  type="text" placeholder="Link referência" value="${p.linkreferencia ?? ''}">
        <input id="${idp}-buy"  type="text" placeholder="Link compra" value="${p.linkcompra ?? ''}">
      </div>
    `;

    const actionsView = `
      <div class="acoes">
        <button onclick="marcarComprado(${indexReal})">${p.comprado ? '✅ Comprado' : '⏳ Pendente'}</button>
        <button onclick="marcarPrioridade(${indexReal})">${p.prioridade ? '📈 Máxima' : '📉 Mínima'}</button>
        <button onclick="editarProduto(${indexReal})">✏️ Editar</button>
        <button onclick="excluirProduto(${indexReal})">❌ Excluir</button>
      </div>
    `;

    const actionsEdit = `
      <div class="edit-actions acoes">
        <button onclick="salvarEdicao(${indexReal}, '${idp}')">💾 Salvar</button>
        <button onclick="cancelarEdicao(${indexReal})">↩️ Cancelar</button>
      </div>
    `;

    lista.innerHTML += `
      <div class="item ${p.prioridade ? 'prioridade' : ''} ${p.editar ? 'editing' : ''}">
        ${p.editar ? editBlock : viewBlock}
        ${p.editar ? actionsEdit : actionsView}
      </div>
    `;
  });

  renderizarResumo(); // mantém o resumo do ambiente (não-filtrado) atualizado
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

  // 1) Atualiza local p/ UI responsiva
  produtos[ambienteAtual].push(produto);
  salvarProdutos();
  renderizarProdutos();

  // 2) Cria no backend
  apiCriar(fromLocalToApi(produto, ambienteAtual))
    .then((obj) => {
      const idx = produtos[ambienteAtual].length - 1;
      if (idx >= 0) {
        produtos[ambienteAtual][idx]._id = obj.id;
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
  p.editar = true;
  salvarProdutos();
  renderizarProdutos();
}

function cancelarEdicao(index) {
  const p = produtos[ambienteAtual][index];
  if (!p) return;
  p.editar = false;
  salvarProdutos();
  renderizarProdutos();
}

function salvarEdicao(index, idp) {
  const p = produtos[ambienteAtual][index];
  if (!p) return;

  // lê valores dos inputs inline
  const get = (s) => document.getElementById(`${idp}-${s}`)?.value ?? '';

  const novo = {
    nomeproduto: get('nome'),
    orcamento: get('orc'),
    valorfinal: get('fin'),
    quantidade: get('qtd'),
    linkreferencia: get('ref'),
    linkcompra: get('buy')
  };

  // Atualiza local
  Object.assign(p, novo);
  p.editar = false;
  salvarProdutos();
  renderizarProdutos();

  if (p._id) {
    apiPatch(p._id, {
      nome: novo.nomeproduto,
      orcamento: parseNumero(novo.orcamento),
      valorfinal: parseNumero(novo.valorfinal),
      quantidade: parseNumero(novo.quantidade) || 1,
      link_referencia: novo.linkreferencia || '',
      link_compra: novo.linkcompra || ''
    }).catch(() => {});
  }
}

// expõe globais (adicione estas duas)
window.salvarEdicao   = salvarEdicao;
window.cancelarEdicao = cancelarEdicao;

// ================== Sync inicial com a API ==================
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
  } catch {
    // se API off, segue no cache local
    renderizarProdutos();
  }
})();

// ================== Expor globais ==================
window.renderizarProdutos = renderizarProdutos;
window.adicionarProduto  = adicionarProduto;
window.marcarComprado    = marcarComprado;
window.marcarPrioridade  = marcarPrioridade;
window.excluirProduto    = excluirProduto;
window.editarProduto     = editarProduto;
window.salvarEdicao      = salvarEdicao;
window.cancelarEdicao    = cancelarEdicao;
window.setFiltro         = setFiltro;
window.setQuery          = setQuery;
