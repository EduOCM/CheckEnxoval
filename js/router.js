window.ambienteAtual = "";

function salvarUltimaTela() {
    salvarLocal("ultimatela", ambienteAtual);
}

function abrirUltimoAmbiente() {
    const ultimaTela = carregarLocal("ultimatela");
    if (ultimaTela) {
        abrirAmbiente(ultimaTela);
    } else {
        document.getElementById("ambienteAtual").style.display = "none";
        ambienteAtual = "";
    }
}

function abrirAmbiente(ambiente) {
    ambienteAtual = ambiente;
    salvarUltimaTela();

    const titulo = {
        cozinha: "🍳 Cozinha",
        quarto: "🛏 Quarto",
        sala: "🛋 Sala de Estar",
        banheiro: "🚿 Banheiro"
    };

    const ambienteDiv = document.getElementById("ambienteAtual");
    if (ambienteDiv) {
        ambienteDiv.style.display = "block";
        document.getElementById("tituloAmbiente").innerText = titulo[ambiente];
    }

    renderizarProdutos(); // função de produtos.js
}

function voltar() {
    const ambienteDiv = document.getElementById("ambienteAtual");
    if (ambienteDiv) {
        ambienteDiv.style.display = "none";
    }
    ambienteAtual = "";
    salvarUltimaTela();
}

window.abrirAmbiente = abrirAmbiente;
window.voltar = voltar;
