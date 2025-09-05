let produtos = carregarLocal("produtos") || {};

if (!produtos.cozinha) produtos.cozinha = [];
if (!produtos.quarto) produtos.quarto = [];
if (!produtos.sala) produtos.sala = [];
if (!produtos.banheiro) produtos.banheiro = [];


function salvarProdutos() {
    salvarLocal("produtos", produtos);
}

function adicionarProduto(produto) {
    if (!ambienteAtual) return;

    if (!produto) {
        // criar produto pegando valores do formulário
        produto = {
            nomeproduto: document.getElementById("nomeproduto").value,
            orcamento: document.getElementById("orcamento").value,
            valorfinal: document.getElementById("valorfinal").value,
            quantidade: document.getElementById("quantidade").value,
            linkreferencia: document.getElementById("linkreferencia").value,
            linkcompra: document.getElementById("linkcompra").value,
            comprado: false,
            prioridade: false,
            editar: false
        };
    }

    produtos[ambienteAtual].push(produto);
    salvarProdutos();
    renderizarProdutos();

    // limpar inputs
    document.getElementById("nomeproduto").value = "";
    document.getElementById("orcamento").value = "";
    document.getElementById("valorfinal").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("linkreferencia").value = "";
    document.getElementById("linkcompra").value = "";
}


function renderizarProdutos() {
    if (!ambienteAtual) return;
    if (!produtos[ambienteAtual]) produtos[ambienteAtual] = []; // garante existência

    const lista = document.getElementById("lista");
    if (!lista) return;

    lista.innerHTML = "";
    produtos[ambienteAtual].forEach((p, index) => {
        lista.innerHTML += `
        <div>
            <strong>${p.nomeproduto}</strong> - R$${p.orcamento || 0} / R$${p.valorfinal || 0}
            <strong>${p.quantidade}</strong>
            <a href="${p.linkreferencia}" target="_blank">link referência</a>
            <a href="${p.linkcompra}" target="_blank">link compra</a>
            <button onclick="marcarComprado(${index})">${p.comprado ? "✅ Comprado" : "⏳ Pendente"}</button>
            <button onclick="marcarPrioridade(${index})">${p.prioridade ? "📈 Máxima" : "📉 Mínima"}</button>
            <button onclick="excluirProduto(${index})">❌ Excluir</button>
            <button onclick="editarProduto(${index})">✏️ Editar</button>
        </div>
        `;
    });
}


function marcarComprado(index) {
    produtos[ambienteAtual][index].comprado = !produtos[ambienteAtual][index].comprado;
    salvarProdutos();
    renderizarProdutos();
}

function marcarPrioridade(index) {
    produtos[ambienteAtual][index].prioridade = !produtos[ambienteAtual][index].prioridade;
    salvarProdutos();
    renderizarProdutos();
}

function excluirProduto(index) {
    produtos[ambienteAtual].splice(index, 1);
    salvarProdutos();
    renderizarProdutos();
}

function editarProduto(index) {
    const produto = produtos[ambienteAtual][index];

    if (!produto) return;

    // Preenche os inputs do formulário com os valores atuais
    document.getElementById("nomeproduto").value = produto.nomeproduto;
    document.getElementById("orcamento").value = produto.orcamento;
    document.getElementById("valorfinal").value = produto.valorfinal;
    document.getElementById("quantidade").value = produto.quantidade;
    document.getElementById("linkreferencia").value = produto.linkreferencia;
    document.getElementById("linkcompra").value = produto.linkcompra;

    // Remove o item da lista (vai ser re-adicionado atualizado)
    produtos[ambienteAtual].splice(index, 1);
    salvarProdutos();
    renderizarProdutos();
}

window.adicionarProduto = adicionarProduto;
window.marcarComprado = marcarComprado;
window.marcarPrioridade = marcarPrioridade;
window.excluirProduto = excluirProduto;
window.editarProduto = editarProduto;

