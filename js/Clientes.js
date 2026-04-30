
const btnSalvar= document.getElementById('btnSalvar');
const formCliente = document.getElementById('formCliente');
const formOrdServ = document.getElementById('formOrdServ');
const tpTerceiro= document.getElementById('tpTerceiro');
const uf=document.getElementById('uf');
const razao=document.getElementById('nomeCliente');
//SELECIONA PADRÃO CLIENTE
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

// FUNÇÃO SALVAR CLIENTES
function salvarCliente() {
    const nomeInput = document.getElementById('nomeCliente');
    
    if (nomeInput.value.trim() === "") {
        alert("Informe o Nome/Razão Social");
        return false;
    }

    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    
    const dadosCliente = {
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
        tpTerceiro: tipoTerceiro,
        uf: optUf,               
    };

    const contador = document.getElementById('contador');       
    const valorContador = contador ? contador.value : "Novo Cadastro";

    // LÓGICA DE DECISÃO
    if (valorContador !== "Novo Cadastro" && valorContador !== "" && clientes[idCliente]) {
        // MODO EDIÇÃO
        dadosCliente.codigo = clientes[idCliente].codigo;
        clientes[idCliente] = dadosCliente;
        alert('Cadastro atualizado com sucesso!');
    } else {
        // MODO NOVO
        dadosCliente.codigo = clientes.length + 1;
        clientes.push(dadosCliente);
        alert('Cliente salvo com sucesso!');
    }

   
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


// LIMPAR A TELA --- 

const btnLimpar = document.getElementById('btnNovo'); // Use o ID do seu botão
if (btnNovo) {
    btnNovo.addEventListener('click', () => {
        limparCliente();        
    });
}
  
function limparCliente() {
    document.querySelectorAll('input, textarea, select').forEach(el => {
        if (el.tagName === 'SELECT') {
            el.selectedIndex = 0; 
        } else {
            el.value = "";
        }
    });

    const campoUf = document.getElementById('uf');
    if (campoUf) campoUf.value = "RS"; 

    tipoTerceiro = "";
    optUf = "RS";
    idCliente = 0; // Reset do índice de navegação

    const contador = document.getElementById('contador');
    if (contador) contador.innerText = "Novo Cadastro";
}



document.addEventListener('DOMContentLoaded', function() {

    //BOTÃO MOVIMENTAR CADASTRO NA TELA
   const movAnterior = document.getElementById('btnAnterior');
    if (movAnterior) {
        // Passa -1 para voltar
        movAnterior.addEventListener('click', () => mudarCadastro(-1));
    }

    const movProximo = document.getElementById('btnProximo');
    if (movProximo) {
        // Passa 1 para avançar
        movProximo.addEventListener('click', () => mudarCadastro(1));
    }

})

function exibirDados() {
    const tabela = JSON.parse(localStorage.getItem("clientes")) || [];    
    const contador = document.getElementById('contador');

    if (tabela.length === 0) {
        if (contador) contador.innerText = "0 / 0";
        return;
    }

    // Garante que o índice está dentro dos limites
    if (idCliente >= tabela.length) idCliente = 0;
    if (idCliente < 0) idCliente = tabela.length - 1;

    const cliente = tabela[idCliente];

    // ATUALIZA AS VARIÁVEIS GLOBAIS COM OS DADOS DO CLIENTE ATUAL
    tipoTerceiro = cliente.tpTerceiro || "";
    optUf = cliente.uf || "RS";

    // PREENCHE OS CAMPOS
    document.getElementById('contador').value = cliente.contador || "1"; 
    document.getElementById('nomeCliente').value = cliente.nome || "";
    document.getElementById('tpTerceiro').value = tipoTerceiro;
    
    document.getElementById('rua').value = cliente.rua || "";
    document.getElementById('numero').value = cliente.numero || "";
    document.getElementById('bairro').value = cliente.bairro || "";
    document.getElementById('cep').value = cliente.cep || "";
    document.getElementById('cidade').value = cliente.cidade || "";
    document.getElementById('uf').value = optUf;

    document.getElementById('cpf').value = cliente.cpf || "";
    document.getElementById('cnpj').value = cliente.cnpj || "";
    document.getElementById('inscEstadual').value = cliente.inscEstadual || "";

    document.getElementById('fone').value = cliente.fone || "";
    document.getElementById('celular').value = cliente.celular || "";
    document.getElementById('email').value = cliente.email || "";
    document.getElementById('resp').value = cliente.responsavel || "";
    document.getElementById('aniver').value = cliente.aniver || "";
    document.getElementById('site').value = cliente.site || "";
   
   
    if (contador) {
        contador.innerText = `${idCliente + 1} de ${tabela.length}`;
    }

}



//FUNÇÃO PARA EXIBIR OS DADOS NA TELA
let idCliente = 0; 

function mudarCadastro(direcao) {
    const tabela = JSON.parse(localStorage.getItem("clientes")) || [];
    
    if (tabela.length === 0) return;
    
    idCliente += direcao;

    if (idCliente >= tabela.length) {
        idCliente = 0;
    }
    if (idCliente < 0) {
        idCliente = tabela.length - 1;
    }

    exibirDados(); 
}
