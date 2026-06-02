// ==========================================
//  VARIÁVEIS GLOBAIS
// ==========================================
let idCliente = 0;
let codigoBusca = 1;
let indiceExistente = -1; // Inicializado em -1 para iniciar em Modo Novo

let tipoTerceiro = "Cliente";
let optUf = "RS";

const btnExcluir = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const formCliente = document.getElementById('formCliente');
const formOrdServ = document.getElementById('formOrdServ');
const tpTerceiro = document.getElementById('tpTerceiro');
const uf = document.getElementById('uf');
const razao = document.getElementById('nomeCliente');

// ==========================================
// INICIALIZAÇÃO DA TABELA
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const formClienteElement = document.getElementById('formCliente');
    if (formClienteElement) {
        formClienteElement.addEventListener('submit', (e) => {
            e.preventDefault(); 
        });
    }
    
    limparCliente(); 
    
    tpTerceiro?.addEventListener('change', (e) => tipoTerceiro = e.target.value);
    uf?.addEventListener('change', (e) => optUf = e.target.value);
    btnSalvar?.addEventListener('click', salvarCliente);
    document.getElementById('btnNovo')?.addEventListener('click', limparCliente);
    btnExcluir?.addEventListener('click', excluirCliente);

    document.getElementById('btnAnterior')?.addEventListener('click', () => mudarCadastro(-1));
    document.getElementById('btnProximo')?.addEventListener('click', () => mudarCadastro(1));  

    const btnSino = document.getElementById('btnSino');
    const dropdown = document.getElementById('listaNiverDropdown');
    
    if (btnSino && dropdown) {
        // Função única para alternar o menu
        const alternarDropdown = (e) => {
            e.preventDefault(); // Evita clique duplo no mobile
            e.stopPropagation(); 
            
            const estiloAtual = window.getComputedStyle(dropdown).display;
            dropdown.style.display = estiloAtual === 'none' ? 'block' : 'none';
        };

        // Escuta clique e toque no botão do sino
        btnSino.addEventListener('click', alternarDropdown);
        btnSino.addEventListener('touchstart', alternarDropdown, { passive: false });

        // Fecha o dropdown ao clicar fora (computadores)
        document.addEventListener('click', () => {
            dropdown.style.display = 'none';
        });

        // Fecha o dropdown ao tocar fora (celulares) sem quebrar a rolagem da tela
        document.addEventListener('touchend', (e) => {
            if (!btnSino.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    } // <-- ESSA CHAVE ESTAVA FALTANDO E QUEBRAVA O CÓDIGO

    // Dispara a leitura inicial ao carregar a página
    verificarNotificacoesSino(5);
});


// ==========================================
// NAVEGAÇÃO ENTRE CADASTROS
// ==========================================
function mudarCadastro(direcao) {
    const tabela = JSON.parse(localStorage.getItem("clientes")) || [];
    if (tabela.length === 0) return;
    
    idCliente += direcao;

    if (idCliente >= tabela.length) idCliente = 0;
    if (idCliente < 0) idCliente = tabela.length - 1;

    // Atualiza os índices de controle para ativar o Modo Edição
    indiceExistente = idCliente;
    codigoBusca = tabela[idCliente].codigo;

    exibirDados(); 
}



function salvarCliente() {
    const nomeInput = document.getElementById('nomeCliente');
    if (!nomeInput || !nomeInput.value.trim()) {
        alert("Informe o Nome/Razão Social");
        return false;
    }

    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];        

    const valorInputDate = document.getElementById('aniver').value;
    let dataFormatadaBr = "";
    
    // Tratamento robusto para converter AAAA-MM-DD para DD/MM
    if (valorInputDate && valorInputDate.includes('-')) {
        const partes = valorInputDate.split('-'); 
        const mes = partes[1];
        const dia = partes[2];
        dataFormatadaBr = `${dia}/${mes}`; 
    }

    // Captura o código que está digitado ou exibido no campo da tela
    const codigoTela = document.getElementById('codigo')?.value || "";

    const dadosCliente = {
        codigo: codigoTela, 
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
        aniver: dataFormatadaBr,
        site: document.getElementById('site').value,
        tpTerceiro: tipoTerceiro,        
    };
    
    // Converte ambos para String para evitar problemas se um for número e o outro texto
    const indexExistente = clientes.findIndex(c => String(c.codigo) === String(codigoTela));

    // Se o código da tela for válido E ele foi encontrado no array, é uma EDIÇÃO
    if (codigoTela !== "" && indexExistente !== -1) {    
        clientes[indexExistente] = dadosCliente;
        alert(`Cadastro ${codigoTela} atualizado com sucesso!`);
    } else {       
        // Se for um CLIENTE NOVO, gera o próximo código sequencial automaticamente
        const maiorCodigo = clientes.reduce((max, c) => Math.max(max, Number(c.codigo) || 0), 0);
        dadosCliente.codigo = maiorCodigo + 1;
        
        clientes.push(dadosCliente);
        alert(`Cliente  ${dadosCliente.codigo} salvo com sucesso!`);
    }

    localStorage.setItem('clientes', JSON.stringify(clientes));
    
    // Executa a atualização do sino 
    if (typeof verificarNotificacoesSino === 'function') {
        verificarNotificacoesSino(5); 
    }
    
    limparCliente(); 
    return true; 
}

function excluirCliente() {
    const codCli = document.getElementById('codigo');
    const codExcluir = codCli ? codCli.value : "";

    if (!codExcluir) {
        alert("Selecione um cliente para excluir.");
        return;
    }

    if (!confirm("Tem certeza que deseja excluir este cadastro?")) return;

    let clientesAtuais = JSON.parse(localStorage.getItem('clientes')) || [];
    const novaLista = clientesAtuais.filter(item => String(item.codigo) !== String(codExcluir));

    localStorage.setItem('clientes', JSON.stringify(novaLista));
    alert("Excluído com sucesso!");
    
    verificarNotificacoesSino(5);
    limparCliente();
}

function exibirDados() {
    const tabela = JSON.parse(localStorage.getItem("clientes")) || [];    
    if (tabela.length === 0 || idCliente < 0) return;

    const cliente = tabela[idCliente];
    tipoTerceiro = cliente.tpTerceiro || "Cliente";
    optUf = cliente.uf || "RS";

    document.getElementById('codigo').value = cliente.codigo || ""; 
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
    document.getElementById('site').value = cliente.site || "";
    document.getElementById('resp').value = cliente.responsavel || "";
    document.getElementById('celular').value = cliente.celular || "";
    document.getElementById('email').value = cliente.email || "";

    // Reconverte DD/MM para o formato aceito pelo HTML5 (AAAA-MM-DD) com validação de segurança
    const campoAniver = document.getElementById('aniver');
    if (campoAniver) {
        if (cliente.aniver && cliente.aniver.includes('/') && !cliente.aniver.includes('[object')) {
            const partes = cliente.aniver.split('/');
            if (partes.length === 2) {
                const dia = partes[0].padStart(2, '0');
                const mes = partes[1].padStart(2, '0');
                const anoAtual = new Date().getFullYear();
                
                campoAniver.value = `${anoAtual}-${mes}-${dia}`;
            } else {
                campoAniver.value = "";
            }
        } else {
            campoAniver.value = "";
        }
    }

}

// ==========================================
// 🔔 PROCESSAMENTO DO SINO
// ==========================================
function verificarNotificacoesSino(diasDeAntecedencia = 5) {
    const contadorEl = document.getElementById('contadorNiver');
    const listaEl = document.getElementById('itensNotificacao');
    if (!listaEl) return;

    const dadosLocais = localStorage.getItem('clientes');
    if (!dadosLocais) {
        listaEl.innerHTML = '<li style="padding:12px; text-align:center; color:#888; font-size:12px;">Nenhum cliente cadastrado</li>';
        if (contadorEl) contadorEl.style.display = 'none';
        return;
    }

    const clientes = JSON.parse(dadosLocais);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const anoAtual = hoje.getFullYear();
    
    listaEl.innerHTML = ''; 
    let totalNotificacoes = 0;

    clientes.forEach((cliente, index) => {
        if (!cliente.aniver) return; 

        const partes = cliente.aniver.split('/');
        if (partes.length < 2) return;

        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10); 
        
        if (isNaN(dia) || isNaN(mes)) return;

        let dataNiver = new Date(anoAtual, mes - 1, dia);

        // Se o aniversário já passou este ano, joga o cálculo para o próximo ano
        if (dataNiver < hoje) {
            dataNiver.setFullYear(anoAtual + 1);
        }

        const diferencaTempo = dataNiver - hoje;
        const diferencaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));

        if (diferencaDias === 0 || (diferencaDias > 0 && diferencaDias <= diasDeAntecedencia)) {
            totalNotificacoes++;
            
            let mensagem = '';
            const nomeExibicao = cliente.nome || 'Cadastro sem nome';

            if (diferencaDias === 0) {
                mensagem = `🎉 <b>${nomeExibicao}</b> é HOJE!`;
            } else if (diferencaDias === 1) {
                mensagem = `⏰ <b>${nomeExibicao}</b> é amanhã!`;
            } else {
                mensagem = `📅 <b>${nomeExibicao}</b> em ${diferencaDias} dias (${cliente.aniver})`;
            }

            const li = document.createElement('li');
            li.style.padding = '10px 15px';
            li.style.borderBottom = '1px solid #eee';
            li.style.fontSize = '12px';
            li.style.color = '#333';
            li.style.cursor = 'pointer';
            li.innerHTML = message = mensagem;
            
            li.onmouseover = () => li.style.background = '#f5f5f5';
            li.onmouseout = () => li.style.background = 'white';

            li.addEventListener('click', () => {
                idCliente = index;
                indiceExistente = index;
                codigoBusca = cliente.codigo;
                exibirDados();
            });

            listaEl.appendChild(li);
        }
    });

    if (totalNotificacoes > 0 && contadorEl) {
        contadorEl.innerText = totalNotificacoes;
        contadorEl.style.display = 'block';
    } else if (contadorEl) {
        contadorEl.style.display = 'none';
        listaEl.innerHTML = '<li style="padding:15px; text-align:center; color:#888; font-size:12px;">Nenhum aniversário nos próximos dias.</li>';
    }
}


function limparCliente() {
    // Limpa os campos do formulário de clientes 
    const form = document.getElementById('formCliente');
    if (form) {
        form.reset(); 
    } else {
        // Alternativa caso não use a tag <form>: limpa apenas inputs que NÃO sejam botões
        document.querySelectorAll('#formCliente input:not([type="button"]):not([type="submit"]), #formCliente textarea').forEach(el => el.value = "");
    }
    
    // Busca  os dados do localStorage
    let tabela = [];
    try {
        tabela = JSON.parse(localStorage.getItem('clientes')) || [];
    } catch (e) {
        console.error("Erro ao ler localStorage:", e);
        tabela = [];
    }
    
    //Define o próximo ID automático
    const maiorCodigo = tabela.reduce((max, c) => Math.max(max, Number(c.codigo) || 0), 0);
    const proximoNumero = maiorCodigo + 1;

    // Insere o código gerado no campo 
    const campoCodigo = document.getElementById('codigo');
    if (campoCodigo) {
        campoCodigo.value = proximoNumero;
    }

    // Reseta padrões visuais e variáveis globais
    const campoUf = document.getElementById('uf');
    if (campoUf) campoUf.value = "RS"; 
    
    tipoTerceiro = "Cliente"; 
    optUf = "RS";
    idCliente = 0;            
    indiceExistente = -1;     
    
    const contador = document.getElementById('contador');
    if (contador) {
        contador.innerText = "Novo Cadastro";
    }
}
