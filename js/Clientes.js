const btnSalvar= document.getElementById('btnSalvar');
const formCliente = document.getElementById('formCliente');
const formOrdServ = document.getElementById('formOrdServ');
const tpTerceiro= document.getElementById('tpTerceiro');
const uf=document.getElementById('uf');
const razao=document.getElementById('nomeCliente');
let tipoTerceiro="";
//POR PADRÃO SELECIONADO RS
let optUf="RS";


if (tpTerceiro) {
    tpTerceiro.addEventListener('change', (e) => tipoTerceiro = e.target.value);
}

if (uf) {
    uf.addEventListener('change', (e) => {
        optUf = e.target.value;
        console.log("UF selecionada:", optUf);
    });
}

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

    // Cria o objeto com os dados CLIENTES
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
formCliente.addEventListener('submit', (e) => {
    e.preventDefault();
    if (salvarCliente()) {
        formCliente.reset();
        alert('Cliente salvo com sucesso!');
    }   
});



