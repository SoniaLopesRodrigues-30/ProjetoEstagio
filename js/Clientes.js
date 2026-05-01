
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


document.addEventListener('DOMContentLoaded', function() {
    //atualiza a tela
    limparCliente(); 
    //Inicializa os campos e botões principais
    tpTerceiro?.addEventListener('change', (e) => tipoTerceiro = e.target.value);
    uf?.addEventListener('change', (e) => optUf = e.target.value);
    btnSalvar?.addEventListener('click', salvarCliente);
    btnNovo?.addEventListener('click', limparCliente);

    //Botões de Navegação (Mudar Cadastro)
    document.getElementById('btnAnterior')?.addEventListener('click', () => mudarCadastro(-1));
    document.getElementById('btnProximo')?.addEventListener('click', () => mudarCadastro(1));
   
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
});

function mudarCadastro(direcao) {
    const tabela = JSON.parse(localStorage.getItem("clientes")) || [];
    
    if (tabela.length === 0) return;
    
    idxOrdServ += direcao;

    if (idxOrdServ >= tabela.length) {
        idxOrdServ = 0;
    }
    if (idxOrdServ < 0) {
        idxOrdServ = tabela.length - 1;
    }

    exibirDados(); 
}

//SALVA O CADASTRO
function salvarCliente() {
    const nomeInput = document.getElementById('nomeCliente');
    const codigoCliente = document.getElementById('codigo');

    if (!nomeInput.value.trim()) {
        alert("Informe o Nome/Razão Social");
        return false;
    }

    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    
    // Pega o valor atual do código (convertendo para número se necessário)
    const codigoBusca = Number(codigoCliente.value);

    // 2. Procura no banco para ver se o cliente já existe    
    const indiceExistente = clientes.findIndex(c => Number(c.codigo) === codigoBusca);
    const dadosCliente = {
        //DADOS DO CLIENTE *** CARD 1
        codigo: document.getElementById('codigo').value,
        nome: nomeInput.value,
        
        //DADOS DO ENDEREÇO *** CARD 2
        rua: document.getElementById('rua').value,        
        numero: document.getElementById('numero').value,
        bairro: document.getElementById('bairro').value,          
        cidade: document.getElementById('cidade').value,
        cep: document.getElementById('cep').value,      
        uf: optUf,               
        
        //DADOS DOCUMENTAÇÃO *** CARD 3
        cpf: document.getElementById('cpf').value,
        cnpj: document.getElementById('cnpj').value,
        inscEstadual: document.getElementById('inscEstadual').value,

        //DADOS DOCUMENTAÇÃO *** CARD 4
        fone: document.getElementById('fone').value,
        celular: document.getElementById('celular').value,
        email: document.getElementById('email').value,
        responsavel: document.getElementById('resp').value,

        //DADOS INFORMAÇÕES EXTRAS *** CARD 5
        aniver: document.getElementById('aniver').value,
        site: document.getElementById('site').value,
        tpTerceiro: tipoTerceiro,        
    };

    // Testa se o cliente existe no banco
    if (indiceExistente !== -1) {
        // MODO EDIÇÃO (Achou o código no array)
        clientes[indiceExistente] = dadosCliente;
        alert(`Cadastro ${codigoBusca} atualizado com sucesso!`);
    } else {
        // MODO NOVO (Código não existe ou é "Novo Cadastro")
        dadosCliente.codigo = clientes.length > 0 ? Math.max(...clientes.map(c => c.codigo)) + 1 : 1;
        clientes.push(dadosCliente);
        alert('Cliente salvo com sucesso!');
    }

    localStorage.setItem('clientes', JSON.stringify(clientes));
    limparCliente();
    return true; 
}

function limparCliente() {
    // Limpa os campos do formulário
    document.querySelectorAll('input, textarea, select').forEach(el => {
        if (el.tagName === 'SELECT') {
            el.selectedIndex = 0;
        } else {
            el.value = "";
        }
    });

    // Gera o próximo código
    const valorBanco = localStorage.getItem('clientes');
    console.log("ultimo codigo" + valorBanco);
    let proximoNumero = 1;

    if (valorBanco) {
        const listaClientes = JSON.parse(valorBanco);
        if (listaClientes.length > 0) {
            const codigos = listaClientes.map(c => parseInt(c.codigo) || 0);
            const maiorCodigo = Math.max(...codigos);
            proximoNumero = maiorCodigo + 1;
        }
    }

    
    const campoCodigo = document.getElementById('codigo');
    console.log(campoCodigo)
    if (campoCodigo) {
        campoCodigo.value = proximoNumero;
    }
    console.log("Próximo código gerado:", proximoNumero);

    const campoUf = document.getElementById('uf');
    if (campoUf) campoUf.value = "RS"; 
    
    tipoTerceiro = "";
    optUf = "RS";
    idCliente = 0; // Reset do índice de navegação

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



//FUNÇÃO que define qual o próximo cadastro a ser exibido na tela
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
