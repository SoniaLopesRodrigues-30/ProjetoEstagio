// ==========================================
// 🛠️ VARIÁVEIS GLOBAIS
// ==========================================
let idCliente = 0;
let codigoBusca = 1;
let indiceExistente = -1; // Inicializado em -1 para iniciar em Modo Novo

let tipoTerceiro = "Cliente";
let optUf = "RS";

// Elements do DOM carregados globalmente de forma segura
const btnExcluir = document.getElementById('btnExcluir');
const btnSalvar = document.getElementById('btnSalvar');
const formCliente = document.getElementById('formCliente');
const formOrdServ = document.getElementById('formOrdServ');
const tpTerceiro = document.getElementById('tpTerceiro');
const uf = document.getElementById('uf');
const razao = document.getElementById('nomeCliente');

// ==========================================
// 🚀 INICIALIZAÇÃO DO SISTEMA
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
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
        btnSino.addEventListener('click', (e) => {
            e.stopPropagation(); 
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', () => {
            dropdown.style.display = 'none';
        });
    }

    // Dispara a leitura inicial ao carregar a página
    verificarNotificacoesSino(5);
});

// ==========================================
// 🧭 NAVEGAÇÃO ENTRE CADASTROS
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

// ==========================================
// 💾 PERSISTÊNCIA DE DADOS (CRUD)
// ==========================================
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
        aniver: dataFormatadaBr,
        site: document.getElementById('site').value,
        tpTerceiro: tipoTerceiro,        
    };

    if (indiceExistente !== -1) {
        clientes[indiceExistente] = dadosCliente;
        alert(`Cadastro ${codigoBusca} atualizado com sucesso!`);
    } else {
        const maiorCodigo = clientes.reduce((max, c) => Math.max(max, Number(c.codigo) || 0), 0);
        dadosCliente.codigo = maiorCodigo + 1;
        clientes.push(dadosCliente);
        alert('Cliente salvo com sucesso!');
    }

    localStorage.setItem('clientes', JSON.stringify(clientes));
    
    // 🟢 CORREÇÃO: Executa a atualização do sino ANTES de retornar true
    verificarNotificacoesSino(5); 
    
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

function limparCliente() {
    document.querySelectorAll('input, textarea').forEach(el => el.value = "");
    const tabela = JSON.parse(localStorage.getItem('clientes')) || [];
    const maiorCodigo = tabela.reduce((max, c) => Math.max(max, Number(c.codigo) || 0), 0);
    
    codigoBusca = maiorCodigo + 1;
    indiceExistente = -1; // Retorna para Modo Novo
    idCliente = -1;

    const campoCodigo = document.getElementById('codigo');
    if (campoCodigo) campoCodigo.value = codigoBusca;
    
    const campoUf = document.getElementById('uf');
    if (campoUf) campoUf.value = "RS"; 
    
    tipoTerceiro = "Cliente";
    optUf = "RS";
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

    // Reconverte DD/MM para o formato aceito pelo HTML5 (AAAA-MM-DD)
    const campoAniver = document.getElementById('aniver');
    if (cliente.aniver && cliente.aniver.includes('/')) {
        const partes = cliente.aniver.split('/');
        const anoAtual = new Date().getFullYear();
        campoAniver.value = `${anoAtual}-${partes[1]}-${partes[0]}`;
    } else {
        campoAniver.value = "";
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
        const mes = parseInt(partes[1], 10); // 🟢 CORREÇÃO: Captura o índice [1] para ler o mês corretamente
        
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
    
    //atualiza o sininho
    verificarNotificacoesSino(5);

    // Limpa a tela após excluir
    limparCliente();
    if (typeof exibirDados === "function") exibirDados();
}

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

//Notificação do sininho
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
    hoje.setHours(0, 0, 0, 0); // Zera o relógio para comparar apenas o dia
    const anoAtual = hoje.getFullYear();
    
    listaEl.innerHTML = ''; 
    let totalNotificacoes = 0;

    clientes.forEach((cliente, index) => {
        if (!cliente.aniver) return; 
       
        const partes = cliente.aniver.split('/');
        if (partes.length < 2) return; // Pula se o formato estiver inválido

        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10); // Índice 1 captura o mês corretamente
        
        if (isNaN(dia) || isNaN(mes)) return;

        // Cria o objeto de data no ano corrente
        let dataNiver = new Date(anoAtual, mes - 1, dia);

        // Se o aniversário já passou este ano, projeta para o ano seguinte
        if (dataNiver < hoje) {
            dataNiver.setFullYear(anoAtual + 1);
        }

        // Calcula a diferença exata em dias corridos
        const diferencaTempo = dataNiver - hoje;
        const diferencaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));
        

        // Valida se o aniversário está dentro da janela de dias configurada
        // (Verifica se é hoje [0] ou se está nos próximos X dias)
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
            li.innerHTML = mensagem;
            
            li.onmouseover = () => li.style.background = '#f5f5f5';
            li.onmouseout = () => li.style.background = 'white';

            // Garante que ao clicar, salve o índice atual e carregue na tela
            li.addEventListener('click', () => {
                idCliente = index; // Atualiza a variável global de navegação
                exibirDados();    // renderiza o cliente selecionado nos inputs do formulário
            });

            listaEl.appendChild(li);
        }
    });

    // Controla o indicador vermelho numérico do sino
    if (totalNotificacoes > 0 && contadorEl) {
        contadorEl.innerText = totalNotificacoes;
        contadorEl.style.display = 'block';
    } else if (contadorEl) {
        contadorEl.style.display = 'none';
        listaEl.innerHTML = '<li style="padding:15px; text-align:center; color:#888; font-size:12px;">Nenhum aniversário nos próximos dias.</li>';
    }
}
