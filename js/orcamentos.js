
// Inicializações padrão
document.addEventListener('DOMContentLoaded', () => {
    
    inicializarTabelaServicos();
    nrOrc();
    validarTabelaEmTempoReal();
    const tabelaServicos = document.getElementById('tabelaServicos');
    if (tabelaServicos) {
        tabelaServicos.addEventListener('input', function(event) {
            if (event.target.tagName === 'INPUT') {
                const tabelaServicos = document.getElementById('tabelaServicos');
                tabelaServicos.addEventListener('input', tratarMudanca);
                tabelaServicos.addEventListener('change', tratarMudanca);
            }
        }); 
    }

    // BOTÃO SALVAR
    const btn = document.getElementById('btnSalvar');
    if (btn) {
        btn.addEventListener('click', salvarOrcamento);
    }

    // BUSCA CLIENTES CADASTRADOS
    const cliente = document.getElementById('nmCliente');
    if (cliente) {
       selecionaCliente('nmCliente', 'clientes');
    }
    
    // BOTÕES DE NAVEGAÇÃO (ANTERIOR / PRÓXIMO)
    const movAnterior = document.getElementById('btnAnterior');
    if (movAnterior) {
        movAnterior.addEventListener('click', () => mudarCadastro(-1));
    }

    const movProximo = document.getElementById('btnProximo');
    if (movProximo) {
        movProximo.addEventListener('click', () => mudarCadastro(1));
    }

    // BOTÃO LIMPAR TELA
    limparOrc();
    const limpar = document.getElementById('btnNovo');
    if (limpar) {
        limpar.addEventListener('click', () => limparOrc());
    } 

    // BOTÃO EXCLUIR CADASTRO
    const excluir = document.getElementById('btnCancelar');
    if (excluir) {
        excluir.addEventListener('click', () => {
            const nrOrdem = document.getElementById("nrOrc");
            excluirOrc(nrOrdem);
        });
    }    
    
    // SELETOR DE ABAS
    const btnServicos = document.getElementById('aba-servicos');
    const btnCliente = document.getElementById('aba-cliente');

    if (btnServicos) {
        btnServicos.addEventListener('click', () => {
            trocarAba(0); // Abre Serviços / Produtos
        });
    }

    if (btnCliente) {
        btnCliente.addEventListener('click', () => {
            trocarAba(1); // Abre Dados do Cliente
        });
    }
});

//FUNÇÕES DA TABELA
// CHECA SE A TABELA POSSUI DADOS VÁLIDOS
function checarTabelaVazia() {
    const linhas = Array.from(document.querySelectorAll('#tabelaServicos .linha-servico'));
    
    if (linhas.length === 0) return true;

    // Se houver apenas uma linha, verifica se ela está limpa
    if (linhas.length === 1) {
        const inputs = linhas[0].querySelectorAll('input:not(.total)');
        return Array.from(inputs).every(input => input.value.trim() === "");
    }

    // Se houver mais de uma linha, significa que o usuário já preencheu dados nas anteriores
    return false;
}

// ATIVA OU DESATIVA O BOTÃO SALVAR EM TEMPO REAL
function validarTabelaEmTempoReal() {
    const btnSalvar = document.getElementById('btnSalvar');    
    const tabelaVazia = checarTabelaVazia(); 
    
    if (btnSalvar) {
        btnSalvar.disabled = tabelaVazia;
        btnSalvar.style.opacity = tabelaVazia ? "0.5" : "1";
        btnSalvar.style.cursor = tabelaVazia ? "not-allowed" : "pointer";
    }
}

// SOMA A COLUNA "TOTAL" E ATUALIZA O CAMPO EXTERNO
function atualizarTotalGeral() {
    const totaisColunas = document.querySelectorAll('#tabelaServicos tbody .total');
    let somaGeral = 0;    
    
    totaisColunas.forEach(campo => {
        somaGeral += parseFloat(campo.value) || 0;       
    });

    const vlTotalGeral = document.getElementById('vlTotGeral');
    if (vlTotalGeral) {
        vlTotalGeral.value = somaGeral.toFixed(2);
    }
}

// ADICIONA UMA NOVA LINHA SE A ÚLTIMA ESTIVER TOTALMENTE PREENCHIDA
function verificarEAdicionarLinha(linhaAtual) {
    const tbody = linhaAtual.closest('tbody');
    const linhas = tbody.getElementsByClassName('linha-servico');
    const ultimaLinha = linhas[linhas.length - 1];

    if (linhaAtual !== ultimaLinha) return;

    const inputsParaPreencher = linhaAtual.querySelectorAll('input:not(.total)');
    const todosPreenchidos = Array.from(inputsParaPreencher).every(input => input.value.trim() !== "");

    if (todosPreenchidos) {
        const novaLinha = ultimaLinha.cloneNode(true);
        
        novaLinha.querySelectorAll('input').forEach(input => {
            input.value = "";
        });

        tbody.appendChild(novaLinha);
    }
}

// GERENCIADOR DE MUDANÇAS NA TABELA
const tratarMudanca = (event) => {
    const inputModificado = event.target;
    const linha = inputModificado.closest('.linha-servico');
    
    if (!linha) return;

    // Se alterou Valor ou Qtd, faz a multiplicação da linha
    if (inputModificado.classList.contains('valor') || inputModificado.classList.contains('qtd')) {
        const campoValor = linha.querySelector('.valor');
        const campoQtd = linha.querySelector('.qtd');
        const campoTotal = linha.querySelector('.total');

        const valor = parseFloat(campoValor.value) || 0;
        const qtd = parseFloat(campoQtd.value) || 0;

        campoTotal.value = (valor * qtd).toFixed(2);
        
        // Atualiza o total geral externo
        atualizarTotalGeral();
    }

    // Verifica a criação de nova linha
    verificarEAdicionarLinha(linha);

    // Executa a sua validação do botão salvar
    validarTabelaEmTempoReal();
};

//  VINCULA OS EVENTOS NA TABELA (RODA APÓS TODAS AS FUNÇÕES EXISTIREM)
const tabelaServicos = document.getElementById('tabelaServicos');
if (tabelaServicos) {
    tabelaServicos.addEventListener('input', tratarMudanca);
    tabelaServicos.addEventListener('change', tratarMudanca);
}


// FUNÇÕES GERAIS DO ORÇAMENTO

function inicializarTabelaServicos() {
    const tabela = document.querySelector('#tabelaServicos');
    if (!tabela) return;

    tabela.addEventListener('input', function(e) {
        const target = e.target;
        const linha = target.closest('tr');

        // Calcula o total da linha
        if (target.classList.contains('valor') || target.classList.contains('qtd')) {
            calcularTotalLinha(linha);
            atualizarTotalGeral();
        }

        // Adicionar Nova Linha
        if (target.classList.contains('total')) {
            verificarEAdicionarLinha(target, linha);
        }
    });
}

// FUNÇÃO QUE GERA O PRÓXIMO NUMERO DA ORDEM DE SERVIÇO
function nrOrc() {
    const valorBanco = localStorage.getItem('orcamentos');
    let proximoNumero = 1;

    if (valorBanco) {
        const listaOS = JSON.parse(valorBanco);
        
        if (listaOS.length > 0) {
            // Pega todos os códigos, converte para número e acha o maior
            const codigos = listaOS.map(os => parseInt(os.codigo) || 0);
            const maiorCodigo = Math.max(...codigos);
            proximoNumero = maiorCodigo + 1;
        }
    }

    // Formata com zeros à esquerda (ex: 0004)
    const numeroFormatado = proximoNumero.toString().padStart(4, '0');
    
    const campo = document.getElementById('nrOrc');
    if (campo) {
        campo.value = numeroFormatado;        
    }

    const campoData = document.getElementById('dataServ');     
    if (campoData) {
        campoData.value = new Date().toISOString().split('T')[0];
    }
}

//*********FUNÇÕES DA TABELA********

//  Função que calcula o total de uma linha
function calcularTotalLinha(linha) {
   
    const v = parseFloat(linha.querySelector('.valor').value.replace(',', '.')) || 0;
    const q = parseFloat(linha.querySelector('.qtd').value) || 0;
    const campoTotal = linha.querySelector('.total');
    
    if (campoTotal) {
        campoTotal.value = (v * q).toFixed(2);
    }
}




//FUNÇÃO VALIDA LINHAS DA TABELA
function inicializarTabelaServicos() {
    const tabela = document.querySelector('#tabelaServicos');
    if (!tabela) return;

    tabela.addEventListener('input', function(e) {
        const target = e.target;
        const linha = target.closest('tr');

        // Calcula o total da linha
        if (target.classList.contains('valor') || target.classList.contains('qtd')) {
            calcularTotalLinha(linha);
            if (typeof atualizarTotalGeral === 'function') atualizarTotalGeral();
        }

        // Adicionar Nova Linha
        if (target.classList.contains('qtd')) {
            verificarEAdicionarLinha(target, linha);
        }
    });
}

// CALCULA O TOTAL DA LINHA
function calcularTotalLinha(linha) {
    const v = parseFloat(linha.querySelector('.valor').value.replace(',', '.')) || 0;
    const q = parseFloat(linha.querySelector('.qtd').value) || 0;
    const campoTotal = linha.querySelector('.total');
    
    if (campoTotal) {
        campoTotal.value = (v * q).toFixed(2);
    }
}

// CONFERE SE EXITEM LINHAS A SEREM GRAVADAS NA TABELA
function controlaservico() {
    const tabela = document.getElementById('tabelaServicos');
    const linhas = tabela.querySelectorAll('tbody tr');

    if (linhas.length === 0) {
        alert("Informe pelo menos um serviço ou produto!");
        return true;
    }

    for (const [index, linha] of linhas.entries()) {
        const inputs = linha.querySelectorAll('input:not([type="hidden"]):not([disabled])');
        if (inputs.length === 0) continue; // Pula a linha se não houver inputs válidos

        const ePrimeiraLinha = (index === 0);
        const primeiroCampoPreenchido = inputs[0].value.trim() !== "";

        // Regra: Valida a linha se for a primeira OU se a linha atual tiver o primeiro campo preenchido
        if (ePrimeiraLinha || primeiroCampoPreenchido) {
            for (const input of inputs) {
                if (!input.value.trim()) {
                    alert(`Atenção: Preencha todos os campos da linha ${index + 1}!`);
                    input.focus();
                    return true; 
                }
            }
        }
    }
    return false; 
}

// ADICIONA LINHA NA TABELA
function verificarEAdicionarLinha(inputData, linhaAtual) {
    const tbody = inputData.closest('tbody');
    const linhas = tbody.getElementsByClassName('linha-servico');
    const ultimaLinha = linhas[linhas.length - 1];

    if (linhaAtual === ultimaLinha && inputData.value !== "") {
        const novaLinha = ultimaLinha.cloneNode(true);
        
        // Limpa os valores e remove IDs duplicados para evitar bugs de seleção
        novaLinha.querySelectorAll('input').forEach(input => {
            input.value = "";
            if(input.id) input.removeAttribute('id'); 
        });

        tbody.appendChild(novaLinha);
       
    }
}

//Função para trocas as abas    
function trocarAba(index) {
    const abas = document.querySelectorAll(".btn-aba");
    const conteudos = document.querySelectorAll(".aba");

    abas.forEach(aba => aba.classList.remove("ativa"));
    conteudos.forEach(c => c.classList.remove("ativa"));

    abas[index].classList.add("ativa");
    conteudos[index].classList.add("ativa");
}


// FUNÇÃO PARA SALVAR ORÇAMENTO
function salvarOrcamento() {
    const nmCliente = document.getElementById('nmCliente');   
    
    // Valida se o cliente foi informado
    if (!nmCliente || !nmCliente.value.trim()) {
        alert("Informe o Cliente!");
        return false;
    }

    // Testa as linhas da tabela de serviços
    if (controlaservico()) { 
       return false; 
    }

    try {
        
        const orc = JSON.parse(localStorage.getItem('orcamentos')) || [];
        const nrOrc = document.getElementById('nrOrc')?.value || "";

        // Captura itens e remove linhas sem descrição preenchida
        const itens = Array.from(document.querySelectorAll('.linha-servico'))
            .map(linha => ({
                descricao: linha.querySelector('.descProd')?.value.trim() || "",
                valor: linha.querySelector('.valor')?.value || "0.00",
                qtd: linha.querySelector('.qtd')?.value || "0",
                total: linha.querySelector('.total')?.value || "0.00"                
            }))
            .filter(item => item.descricao !== ""); // Melhorado: foca na descrição válida

        // Monta o objeto com os dados da tela
        const novaOrdem = {
            //DADOS GERAIS
            codigo: nrOrc,
            data: document.getElementById('dataOrc')?.value || "",
            condPgto: document.getElementById('condPgto')?.value || "",

            //DADOS DO CLIENTE
            cliente: nmCliente.value,
            endCli: document.getElementById('endCli')?.value || "",
            endNr: document.getElementById('endNr')?.value || "",
            endCidade: document.getElementById('endCidade')?.value || "",
            endUF: document.getElementById('endUf')?.value || "",
            cnpj: document.getElementById('cnpj')?.value || "",
            foneCli: document.getElementById('fone')?.value || "",
            //ITENS DO ORÇAMENTO
            itens: itens,

            //DEMAIS INFORMAÇÕES
            vlTotGeral: document.getElementById('vlTotGeral')?.value || "0.00",
            obs: document.getElementById('obs')?.value || "",
            dataRegistro: new Date().toISOString() 
        };

        // Verifica se é uma edição ou um novo registro
        const index = orc.findIndex(os => os.codigo === nrOrc);
        
        
        if (nrOrc && index !== -1) {
            orc[index] = novaOrdem; // Atualiza o existente
        } else {
            orc.push(novaOrdem); // Adiciona novo
        }

        // SALVA NO LOCALSTORGE
        localStorage.setItem('orcamentos', JSON.stringify(orc));
        
        alert("Orçamento salvo com sucesso!");               
        limparOrc();      
        return true;

    } catch (error) {
        console.error("Erro ao salvar no localStorage:", error);
        alert("Erro ao salvar os dados.");
        return false;
    }
}

//FUNÇÃO PARA EXIBIR OS DADOS NA TELA
let idxOrc = 0; 

function mudarCadastro(direcao) {
    const tabela = JSON.parse(localStorage.getItem("orcamentos")) || [];
    
    if (tabela.length === 0) return;
    idxOrc += direcao;

    if (idxOrc >= tabela.length) {
        idxOrc = 0;
    }
    if (idxOrc < 0) {
        idxOrc = tabela.length - 1;
    }

    exibirDados(); 
}

function exibirDados() {
    const tabela = JSON.parse(localStorage.getItem("orcamentos")) || [];    
    const contador = document.getElementById('contador');

    if (tabela.length === 0) {
        console.log("Nenhum cadastro encontrado.");
        if (contador) contador.innerText = "0 / 0";
        return;
    }

    if (idxOrc >= tabela.length) idxOrc = 0;
    if (idxOrc < 0) idxOrc = tabela.length - 1;

    const ordem = tabela[idxOrc];

    // PREENCHE OS DADOS GERAIS DO ORÇAMENTO
    document.getElementById('nrOrc').value = ordem.codigo || "";
    document.getElementById('condPgto').value= ordem.condPgto || "";
    document.getElementById('dataOrc').value = ordem.data || "";

    //PREENCHE OS DADOS DO CLIENTE
    document.getElementById('nmCliente').value = ordem.cliente || "";
    document.getElementById('endCli').value = ordem.endCli || "";
    document.getElementById('endNr').value = ordem.endNr || "";
    document.getElementById('endCidade').value = ordem.endCidade || "";
    document.getElementById('endUf').value = ordem.endUF || "";
    document.getElementById('cnpj').value = ordem.cnpj || "";
    document.getElementById('fone').value = ordem.foneCli || "";

    //PREENCHE DOS DEMAIS DADOS
    document.getElementById('vlTotGeral').value = ordem.vlTotGeral || "";
    document.getElementById('obs').value = ordem.obs || "";

    // ITENS DA TABELA  DESCRIÇÃO DO ORÇAMENTO
    renderizarItensOrdem(ordem.itens);

    if (contador) {
        contador.innerText = `${idxOrc + 1} de ${tabela.length}`;
    }
}

// Função auxiliar para reconstruir as linhas de produtos/serviços
function renderizarItensOrdem(itens) {
    const tbody = document.querySelector('#tabelaServicos tbody');
    if (!tbody) return;

    tbody.innerHTML = ""; // Limpa a tabela

    if (itens && itens.length > 0) {
        itens.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = 'linha-servico';
            tr.innerHTML = `                
                <td><input type="text" class="descProd" value="${item.descricao}"></td>
                <td><input type="number" class="qtd" value="${item.qtd}"></td>
                <td><input type="text" class="valor" value="${item.valor}"></td>
                <td><input type="text" class="total" value="${item.total}" readonly></td>                
            `;
            tbody.appendChild(tr);
        });
    }
        
}


function limparOrc() {
    // Limpa todos os campos do formulário
    document.querySelectorAll('input, textarea').forEach(el => el.value = "");
    
    // Seleciona o corpo da tabela
    const tbody = document.querySelector('#tabelaServicos tbody');
    
    if (tbody) {
        // Remove todos os filhos (linhas) de forma explícita
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }

        //  Cria a "Linha Mestra" (única linha inicial)
        const novaLinha = document.createElement('tr');
        novaLinha.className = 'linha-servico';
        novaLinha.innerHTML = `
            <td><input class="descProd" type="text"></td>
            <td><input class="valor" type="number" step="0.01"></td>
            <td><input class="qtd" type="number"></td>
            <td><input class="total" type="text" readonly></td>`;
        
        tbody.appendChild(novaLinha);
    }
    
    // Reset do número da OS e foco no primeiro campo
    if (typeof nrOrc === "function") nrOrc();
    document.getElementById('nmCliente')?.focus();
}



// FUNÇÃO PARA EXCLUIR ORDEM
function excluirOrc() {
    // Captura o numero do Orçamento a ser excluido
    const campoNrOS = document.getElementById('nrOrc');
    const valorOS = campoNrOS ? campoNrOS.value : "";

    if (!valorOS) {
        alert("Selecione o orçamento para excluir.");
        return;
    }

    // Confirmação do usuário
    if (!confirm(`Tem certeza que deseja excluir o Orçamento nº ${valorOS}?`)) {
        return;
    }

    // Busca os dados atuais
    let ordServ = JSON.parse(localStorage.getItem('orcamentos')) || [];

    // Filtra a lista mantendo apenas o que NÃO for o código informado
    const novaLista = ordServ.filter(ordem => ordem.codigo !== valorOS);

    // Verifica se algo foi removido de fato
    if (ordServ.length === novaLista.length) {
        alert("Orçamento não encontrado no banco de dados.");
        return;
    }

    // Salva a nova lista e atualiza a tela
    localStorage.setItem('orcamentos', JSON.stringify(novaLista));
    alert("Orçamento excluido com sucesso!");
    
    // Limpa a tela após excluir
    limparOrc();
    if (typeof exibirDados === "function") exibirDados();
}


// FUNÇÃO QUE GERA O PRÓXIMO NUMERO DO ORÇAMENTO
function nrOS() {
    const valorBanco = localStorage.getItem('orcamentos');
    let proximoNumero = 1;

    if (valorBanco) {
        const listaOS = JSON.parse(valorBanco);
        
        if (listaOS.length > 0) {
            // Pega todos os códigos, converte para número e acha o maior
            const codigos = listaOS.map(os => parseInt(os.codigo) || 0);
            const maiorCodigo = Math.max(...codigos);
            proximoNumero = maiorCodigo + 1;
        }
    }

    // Formata com zeros à esquerda (ex: 0004)
    const numeroFormatado = proximoNumero.toString().padStart(4, '0');
    
    const campo = document.getElementById('nrOrc');
    if (campo) {
        campo.value = numeroFormatado;        
    }

    const campoData = document.getElementById('dataServ');     
    if (campoData) {
        campoData.value = new Date().toISOString().split('T')[0];
    }
}

//abre uma lista de clientes cadastrados no localStorage
function selecionaCliente(idInput, chaveLocalStorage) {
    const input = document.getElementById(idInput);
    if (!input) return;

    const idDatalist = `lista-${idInput}`;
    let dataList = document.getElementById(idDatalist) || document.createElement('datalist');
    
    if (!dataList.id) {
        dataList.id = idDatalist;
        input.parentNode.appendChild(dataList);
        input.setAttribute('list', idDatalist);
    }

    // mostra os clientes cadastrados
    input.addEventListener('input', () => {
    const termo = input.value.toLowerCase();
    const dados = JSON.parse(localStorage.getItem(chaveLocalStorage) || '[]');
    dataList.innerHTML = '';

    if (termo.length > 0) {
        //  Filtra os clientes para as sugestões
        const filtrados = dados.filter(item => item.nome && item.nome.toLowerCase().includes(termo));

        filtrados.forEach(item => {
            const option = document.createElement('option');
            option.value = item.nome;
            dataList.appendChild(option);
        });

        
        // preenche os dados dos clientes selecionados
        const clienteSelecionado = filtrados.find(item => item.nome.toLowerCase() === termo);
        console.log(clienteSelecionado);
        if (clienteSelecionado) {
            
            const endCli = document.getElementById('endCli');
            const endNr= document.getElementById('endNr');
            const endCidade=document.getElementById('endCidade');
            const endUF=document.getElementById('endUf');
            const cnpj=document.getElementById('cnpj');
            const foneCli=document.getElementById('fone');

            if (endCli) endCli.value = clienteSelecionado.rua || ""; 
            if (endNr) endNr.value = clienteSelecionado.numero || "";
            if (endCidade) endCidade.value = clienteSelecionado.cidade || "";
            if (endUF) endUF.value = clienteSelecionado.uf || "";
            if (cnpj) cnpj.value = clienteSelecionado.cnpj || "";
            if (foneCli) foneCli.value = clienteSelecionado.fone || "";
           
        }
    }
});

}

//  FUNÇÃO PARA CONVERTER ORÇAMENTO EM O.S.

const btnGerarOS = document.getElementById('btnGerarOS');
if (btnGerarOS) {
    btnGerarOS.addEventListener('click', converterOrcamentoEmOrdemServico);
}

// 2. FUNÇÃO PARA CONVERTER E SALVAR COM O ÚLTIMO NÚMERO SEQUENCIAL + 1
function converterOrcamentoEmOrdemServico() {
    const nrOrcInput = document.getElementById('nrOrc');
    const nrOrc = nrOrcInput?.value.trim() || "";

    if (nrOrc === "") {
        alert("Por favor, selecione ou salve um orçamento antes de transformá-lo em O.S.");
        return;
    }

    // Busca a lista de ORÇAMENTOS para encontrar os dados originais
    const bancoOrcamentos = localStorage.getItem('orcamentos');
    if (!bancoOrcamentos) {
        alert("Nenhum orçamento encontrado no sistema.");
        return;
    }

    const listaOrcamentos = JSON.parse(bancoOrcamentos);
    const orcamento = listaOrcamentos.find(os => os.codigo === nrOrc);

    if (!orcamento) {
        alert(`O orçamento nº ${nrOrc} precisa estar salvo para ser convertido.`);
        return;
    }

    const confirmar = confirm(`Deseja converter o Orçamento nº ${nrOrc} em uma Ordem de Serviço definitiva?`);
    if (!confirmar) return;

    try {
        //  BUSCA O BANCO DE ORDENS DE SERVIÇO E CALCULA O PRÓXIMO NÚMERO
        const bancoOS = localStorage.getItem('ordServ') || "[]";
        const listaOS = JSON.parse(bancoOS);

        let proximoNumeroOS = 1; // Número padrão caso seja a primeira O.S. do sistema

        if (listaOS.length > 0) {
            // Mapeia todos os códigos existentes, transformando em números reais
            const codigosNumericos = listaOS.map(os => parseInt(os.codigo) || 0);
            
            // Encontra o maior número da lista e soma 1
            const maiorNumero = Math.max(...codigosNumericos);
            proximoNumeroOS = maiorNumero + 1;
        }

        // Converte para String 
        const novoCodigoOS = String(proximoNumeroOS);

        // Clona os dados do orçamento estruturando para o formato de O.S. com o novo número

        const novaOrdemServico = {
            dataRegistro: new Date().toISOString(), 
            codigo: nrOrc,
            data: document.getElementById('dataOrc').value,
            condPgto: document.getElementById('condPgto').value,
            cliente: nmCliente.value,            

            endCli: document.getElementById('endCli').value,
            endNr: document.getElementById('endNr').value,
            endCidade: document.getElementById('endCidade').value,
            endUF: document.getElementById('endUf').value,
            cnpj: document.getElementById('cnpj').value,
            foneCli: document.getElementById('fone').value,
                     
            obs: document.getElementById('obs').value,            
            vlTotGeral: document.getElementById('vlTotGeral').value,  
            vlTotPend: "0,00", 
            status: "PENDENTE",
            origemOrcamento: nrOrc,
            historicoPagamentos: []

        }
        // Adiciona a nova O.S. no Array de Ordens de Serviço
        listaOS.push(novaOrdemServico);

        // SALVA DEFINITIVAMENTE NO LOCALSTORAGE DE ORDENS DE SERVIÇO
        localStorage.setItem('ordServ', JSON.stringify(listaOS));

        alert(`Orçamento convertido com sucesso!\nGerada a Ordem de Serviço Nº: ${novoCodigoOS}`);

        // Opcional: Se estiver na mesma tela, atualiza o campo de número para o usuário ver o novo ID
        if (nrOrcInput) {
            nrOrcInput.value = novoCodigoOS;
        }

        // Opcional: Limpa a tela ou reseta o formulário após a conversão
        if (typeof limparOrc === "function") {
            limparOrc();
        }

    } catch (error) {
        console.error("Erro ao gerar número sequencial da O.S.:", error);
        alert("Erro técnico ao salvar a Ordem de Serviço.");
    }
}
