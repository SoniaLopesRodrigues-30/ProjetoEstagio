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
const btnSalvar= document.getElementById('btnSalvar');
const form = document.getElementById('formCliente');
const tpTerceiro= document.getElementById('tpTerceiro');
const uf=document.getElementById('uf');
const razao=document.getElementById('nomeCliente');
let tipoTerceiro="";
let optUf="";


tpTerceiro.addEventListener('change', (e) => tipoTerceiro = e.target.value);
uf.addEventListener('change', (e) => optUf = e.target.value);

// A FUNÇÃO SALVAR CLIENTES
function salvarCliente() {
    const nomeInput = document.getElementById('nomeCliente');
    
    // Validação
    if (nomeInput.value.trim() === "") {
        alert("Informe o Nome/Razão Social");
        return false; // Retorna falso para indicar que não salvou
    }

    // Busca dados existentes
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];

    // Cria o objeto (Capturando os valores na hora do clique)
    const novoCliente = {
        codigo: clientes.length + 1,
        nome: nomeInput.value,
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
        site: document.getElementById('site').value,
        tpTerceUro: tipoTerceiro,
        uf: optUf,               
    };

    // Salva no localStorage
    clientes.push(novoCliente);
    localStorage.setItem('clientes', JSON.stringify(clientes));
    
    return true; 
}

// O EVENTO DE SUBMIT (Chama a função)
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (salvarCliente()) {
        form.reset();
        alert('Salvo com sucesso!');
        // MAIS ADIANTE LISTAR OS CLIENTES JÁ SALVOS:
        // listarClientes(); 
    }
});