

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
const formCliente = document.getElementById('formCliente');
const formOrdServ = document.getElementById('formOrdServ');
const tpTerceiro= document.getElementById('tpTerceiro');
const uf=document.getElementById('uf');
const razao=document.getElementById('nomeCliente');
let tipoTerceiro="";
let optUf="";


if (tpTerceiro) {
    tpTerceiro.addEventListener('change', (e) => tipoTerceiro = e.target.value);
}
if (uf) {
    uf.addEventListener('change', (e) => optUf = e.target.value);
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


// FUNÇÃO SALVAR ORDENS DE SERVIÇO
function salvarOrdemServ() {
    
    const nmCliente = document.getElementById('nmCliente');
    
    if (!nmCliente || nmCliente.value.trim() === "") {
        alert("Informe o Cliente!");
        return false;
    }

    // Busca dados existentes 
    const ordServ = JSON.parse(localStorage.getItem('ordServ')) || [];

    const novaOrdem = {
        codigo: document.getElementById('nrServico').value, 
        data: document.getElementById('dataServ').value,
        condPgto: document.getElementById('condPgto').value,
        cliente: nmCliente.value,
        vlTotal: document.getElementById('vlTotal').value,
        dtPag: document.getElementById('dtPag').value,
        vlPago: document.getElementById('vlPago').value,
        vlTotPend: document.getElementById('vlTotPend').value,
        vlTotFat: document.getElementById('vlTotFat').value,
        vlTotGeral: document.getElementById('vlTotGeral').value,
        obs: document.getElementById('obs').value
    };

    ordServ.push(novaOrdem);
    localStorage.setItem('ordServ', JSON.stringify(ordServ));
    
    return true; 
}


// O EVENTO DE SUBMIT (Chama a função)

if (formCliente) {
    formCliente.addEventListener('submit', (e) => {
        e.preventDefault();
        if (salvarCliente()) {
            formCliente.reset();
            alert('Cliente salvo com sucesso!');
        }   
    });
}


if (formOrdServ) {
    formOrdServ.addEventListener('submit', (e) => {
        e.preventDefault();        

        const resultado = salvarOrdemServ();        

        if (resultado) {
            formOrdServ.reset();
            alert('Ordem de Serviço salva com sucesso!');                       
        }
    });
}



// Delegação de evento: Funciona mesmo se a tabela for carregada depois
document.addEventListener('input', function(e) {
    // Verifica se quem disparou o evento foi o campo 'valor' ou 'qtd'
    if (e.target.id === 'valor' || e.target.id === 'qtd') {
        
        const inputValor = document.getElementById('valor');
        const inputQtd = document.getElementById('qtd');
        const campoTotal = document.getElementById('total');

        if (inputValor && inputQtd && campoTotal) {
            // Converte valores (trata vírgula e vazio)
            const v = parseFloat(inputValor.value.replace(',', '.')) || 0;
            const q = parseFloat(inputQtd.value.replace(',', '.')) || 0;
            
            const resultado = v * q;
            
            // Atribui ao campo total com 2 casas decimais
            campoTotal.value = resultado.toFixed(2);
            
            // Opcional: Atualiza também o campo de Valor Total Geral da OS se ele existir
            const vlTotalGeral = document.getElementById('vlTotGeral');
            if (vlTotalGeral) {
                vlTotalGeral.value = resultado.toFixed(2);
            }
        }
    }
});
