const btnExcluir=document.getElementById('btnExcluir');
const btnSalvar= document.getElementById('btnSalvar');
const formCliente = document.getElementById('formCliente');
const formOrdServ = document.getElementById('formOrdServ');
const tpTerceiro= document.getElementById('tpTerceiro');
const uf=document.getElementById('uf');
const razao=document.getElementById('nomeCliente');


// VARIÁVEIS GLOBAIS
//USADO NA FUNÇÃO que define qual o próximo cadastro a ser exibido na tela
let idCliente = 0; 
//SELECIONA PADRÃO CLIENTE
let tipoTerceiro="";
//POR PADRÃO SELECIONADO RS
let optUf="RS";

document.addEventListener('DOMContentLoaded', function() {
    //atualiza a tela
    limparCliente(); 
    //Inicializa os campos e botões principais
    tpTerceiro?.addEventListener('change', (e) => tipoTerceiro = e.target.value);
    uf?.addEventListener('change', (e) => optUf = e.target.value);
    btnSalvar?.addEventListener('click', salvarCliente);
    btnNovo?.addEventListener('click', limparCliente);
    btnExcluir?.addEventListener('click', excluirCliente);

    //Botões de Navegação (Mudar Cadastro)
    document.getElementById('btnAnterior')?.addEventListener('click', () => mudarCadastro(-1));
    document.getElementById('btnProximo')?.addEventListener('click', () => mudarCadastro(1));  
   
});

function mudarCadastro(direcao) {
    const tabela = JSON.parse(localStorage.getItem("clientes")) || [];
    
    if (tabela.length === 0) return;
    
    idCliente += direcao;

    if (idCliente>= tabela.length) {
        idCliente = 0;
    }
    if (idCliente < 0) {
        idCliente = tabela.length - 1;
    }

    exibirDados(); 
}

//SALVA O CADASTRO
// ... suas variáveis globais e listeners continuam iguais ...

// SALVA O CADASTRO
function salvarCliente() {
    const nomeInput = document.getElementById('nomeCliente');
    const campoCodigo = document.getElementById('codigo');

    if (!nomeInput.value.trim()) {
        alert("Informe o Nome/Razão Social");
        return false;
    }

    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    
    // Pega o código atual como Número para comparação
    const codigoBusca = Number(campoCodigo.value);

    // Procura se esse código já existe no banco
    const indiceExistente = clientes.findIndex(c => Number(c.codigo) === codigoBusca);

    const dadosCliente = {
        codigo: codigoBusca, 
        nome: nomeInput.value,
        rua: document.getElementById('rua').value,        
        numero: document.getElementById('numero').value,
        bairro: document.getElementById('bairro').value,          
        cidade: document.getElementById('cidade').value,
        cep: document.getElementById('cep').value,      
        uf: optUf,               
        cpf: document.getElementById('cpf').value,
        cnpj: document.getElementById('cnpj').value,
        inscEstadual: document.getElementById('inscEstadual').value,
        fone: document.getElementById('fone').value,
        celular: document.getElementById('celular').value,
        email: document.getElementById('email').value,
        responsavel: document.getElementById('resp').value,
        aniver: document.getElementById('aniver').value,
        site: document.getElementById('site').value,
        tpTerceiro: tipoTerceiro,        
    };

    if (indiceExistente !== -1) {
        // MODO EDIÇÃO: Atualiza o cliente na posição encontrada
        clientes[indiceExistente] = dadosCliente;
        alert(`Cadastro ${codigoBusca} atualizado com sucesso!`);
    } else {
        // MODO NOVO: Garante que o código seja o próximo da sequência caso não exista
        const maiorCodigo = clientes.reduce((max, c) => Math.max(max, Number(c.codigo) || 0), 0);
        dadosCliente.codigo = maiorCodigo + 1;
        
        clientes.push(dadosCliente);
        alert('Cliente salvo com sucesso!');
    }

    localStorage.setItem('clientes', JSON.stringify(clientes));
    limparCliente(); // Limpa e já gera o próximo código automático
    return true; 
}

// FUNÇÃO PARA EXCLUIR O CADASTRO
function excluirCliente() {
    // Captura o código do cliente para exclusão
    const codCli = document.getElementById('codigo');
    const nmCliente= document.getElementById('nomeCliente');
    const codExcluir = codCli ? codCli.value : "";

    if (!codExcluir) {
        alert("Selecione um cliente/Fornecedor para excluir.");
        return;
    }

    // Confirmação do usuário
    if (!confirm(`Tem certeza que deseja excluir o Cliente  ${codExcluir} - ${nmCliente.value}?`)) {
        return;
    }

    // Busca os dados atuais
    let clientesAtuais = JSON.parse(localStorage.getItem('clientes')) || [];

    // Filtra a lista mantendo apenas o que NÃO for o código informado    
    const novaLista = clientesAtuais.filter(item => String(item.codigo) !== String(codExcluir));

    // Verifica se algo foi removido de fato
    if (clientesAtuais.length === novaLista.length) {
        alert("Cliente não encontrado no banco de dados.");
        return;
    }

    // Salva a nova lista e atualiza a tela
    localStorage.setItem('clientes', JSON.stringify(novaLista));
    alert("Cliente/Fornecedor excluido com sucesso!");
    
    // Limpa a tela após excluir
    limparCliente();
    if (typeof exibirDados === "function") exibirDados();
}


//FUNÇÃO PARA LIMPAR A TELA
function limparCliente() {
    // Limpa todos os inputs e selects
    document.querySelectorAll('input, textarea').forEach(el => el.value = "");
    
    const tabela = JSON.parse(localStorage.getItem('clientes')) || [];
    
    // Define o próximo ID automático
    const maiorCodigo = tabela.reduce((max, c) => Math.max(max, Number(c.codigo) || 0), 0);
    const proximoNumero = maiorCodigo + 1;

    const campoCodigo = document.getElementById('codigo');
    if (campoCodigo) campoCodigo.value = proximoNumero;

    // Reseta padrões
    const campoUf = document.getElementById('uf');
    if (campoUf) campoUf.value = "RS"; 
    
    tipoTerceiro = "";
    optUf = "RS";
    idCliente = -1; 
    const contador = document.getElementById('contador');
    if (contador) contador.innerText = "Novo Cadastro";
}


//função que exibe os dados na tela
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
    //DADOS DO CLIENTE *** CARD 1
    document.getElementById('codigo').value = cliente.codigo || "1"; 
    document.getElementById('nomeCliente').value = cliente.nome || "";
    document.getElementById('tpTerceiro').value = tipoTerceiro;
    
    //DADOS DO ENDEREÇO *** CARD 2
    document.getElementById('rua').value = cliente.rua || "";
    document.getElementById('numero').value = cliente.numero || "";
    document.getElementById('bairro').value = cliente.bairro || "";
    document.getElementById('cep').value = cliente.cep || "";
    document.getElementById('cidade').value = cliente.cidade || "";
    document.getElementById('uf').value = optUf;

     //DADOS DOCUMENTAÇÃO *** CARD 3
    document.getElementById('cpf').value = cliente.cpf || "";
    document.getElementById('cnpj').value = cliente.cnpj || "";
    document.getElementById('inscEstadual').value = cliente.inscEstadual || "";


    //DADOS DOCUMENTAÇÃO *** CARD 4
    document.getElementById('fone').value = cliente.fone || "";
    document.getElementById('celular').value = cliente.celular || "";
    document.getElementById('email').value = cliente.email || "";

    //DADOS INFORMAÇÕES EXTRAS *** CARD 5
    document.getElementById('resp').value = cliente.responsavel || "";
    document.getElementById('aniver').value = cliente.aniver || "";
    document.getElementById('site').value = cliente.site || "";
   
   
    if (contador) {
        contador.innerText = `${idCliente + 1} de ${tabela.length}`;
    }

}

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

