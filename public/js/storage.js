function salvarLocal(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function carregarLocal(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}
