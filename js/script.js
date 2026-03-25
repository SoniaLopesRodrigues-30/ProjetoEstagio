function login() {
// -- declara -- //
    const usuario = document.getElementById("usuario").value;    // pega os valores dos campos //
    const senha = document.getElementById("senha").value;
    // -- info de login corretas -- //
    if (usuario === "cinema" && senha === "123") {
        // -- sessionStorage -- //
        sessionStorage.setItem("logado", "true");
        window.location.href = "filmes.html";
    } else {
        document.getElementById("erro").style.display = "block";        
    }
}


const form = document.getElementById('formCliente');


// Captura os eventos do formulário Clientes
form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Captura os valores
    const novoCliente = {
        nome: document.getElementById('nomeCliente').value,
        rua: document.getElementById('rua').value,
        email: document.getElementById('email').value,
        numero: document.getElementById('numero').value,
        cep: document.getElementById('cep').value,
        cidade: document.getElementById('cidade').value,
        bairro: document.getElementById('bairro').value,
        cpf: document.getElementById('cpf').value,
        cnpj: document.getElementById('cnpj').value,
        inscEstadual: document.getElementById('inscEstadual').value,
        fone: document.getElementById('fone').value,
        celular: document.getElementById('celular').value,
        responsavel: document.getElementById('resp').value,
        aniver: document.getElementById('aniver').value,
        site: document.getElementById('site').value
    };

    // Recupera a lista atual ou cria uma vazia
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];

    // Adiciona o novo cliente ao array e salva de volta no localStorage
    clientes.push(novoCliente);
    localStorage.setItem('clientes', JSON.stringify(clientes));

    // Limpa o formulário e atualiza a tela
    form.reset()
  
});


