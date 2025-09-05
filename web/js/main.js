document.addEventListener("DOMContentLoaded", () => {
    // Renderiza produtos se houver algum salvo
    renderizarProdutos();

    // Abre último ambiente salvo
    abrirUltimoAmbiente();

    // Conecta formulário
    const form = document.getElementById("formulario");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const produto = {
                nomeproduto: document.getElementById("nomeproduto").value,
                orcamento: document.getElementById("orcamento").value,
                valorfinal: document.getElementById("valorfinal").value,
                quantidade: document.getElementById("quantidade").value,
                linkreferencia: document.getElementById("linkreferencia").value,
                linkcompra: document.getElementById("linkcompra").value,
                comprado: false,
                prioridade: false
            };

            if (produto.nome.trim() !== "") {
                adicionarProduto(produto);
                form.reset();
            }
        });
    }
});

//("produtos", []); //Limpar o LocalStorage
