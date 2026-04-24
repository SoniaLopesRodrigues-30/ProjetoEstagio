
let indiceAtual = 0; 

const menuToggle = document.getElementById("id-btn-menu");
const nav = document.getElementById("nav");

menuToggle.addEventListener("click", () => {
    mostrarDados();
    nav.classList.toggle("ativo");
});

// 2. Função para os botões "Anterior" e "Próximo"
function mudarCadastro(direcao) {
    // direcao será 1 ou -1
    indiceAtual += direcao;
    exibirDados();
}

function mostrarDados() {
    const tabela = JSON.parse(localStorage.getItem("ordServ")) || [];    
    const contador = document.getElementById('contador');
    
    if (tabela.length === 0) {
        console.log("Nenhum cadastro encontrado.");
        if (contador) contador.innerText = "0 / 0";
        return;
    }

    if (indiceAtual >= tabela.length) indiceAtual = 0;
    if (indiceAtual < 0) indiceAtual = tabela.length - 1;

    const cadastro = tabela[indiceAtual];

    // --- DIRECIONAMENTO PARA A FUNÇÃO NO ARQUIVO DE ORDEM DE SERVIÇO ---
    exibirDados(cadastro); 
   
    if (contador) {
        contador.innerText = `${indiceAtual + 1} de ${tabela.length}`;
    }
}
