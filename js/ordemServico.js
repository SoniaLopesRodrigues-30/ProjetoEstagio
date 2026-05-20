document.addEventListener('DOMContentLoaded', () => {
    inicializarTabelaServicos();
    nrOS(); // Gera ou carrega o número da OS atual

    selecionaCliente('nmCliente', 'clientes');

    document.getElementById('tabelaServicos').addEventListener('input', function(event) {
        if (event.target.tagName === 'INPUT') {
            validarTabelaEmTempoReal(); 
        }
    }); 

    // BOTÃO SALVAR
    const btn = document.getElementById('btnSalvar');
    if (btn) {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            if (!controlaservico()) { 
                salvarOrdemServ(); 
            }
        });
    }

    // BOTÃO BAIXAR VALOR
    const baixa = document.getElementById('btnBaixar');
    if (baixa) {
        baixa.addEventListener('click', baixarOrdem);
    }

    // BOTÕES DE MOVIMENTAÇÃO
    const movAnterior = document.getElementById('btnAnterior');
    if (movAnterior) {
        movAnterior.addEventListener('click', () => mudarCadastro(-1));
    }

    const movProximo = document.getElementById('btnProximo');
    if (movProximo) {
        movProximo.addEventListener('click', () => mudarCadastro(1));
    }

    //LIMPAR A ORDEM
    const limpar = document.getElementById('btnNovo');
    if (limpar) {
        limpar.addEventListener('click', () => limparOrdem());
    } 

    //EXCLUIR A ORDEM
    const excluir = document.getElementById('btnCancelar');
    if (excluir) {        
        excluir.addEventListener('click', excluirOrdemServ);
    } 
});


// FUNÇÕES DA ORDEM DE SERVIÇO
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
        if (target.classList.contains('data-servico')) {
            verificarEAdicionarLinha(target, linha);
        }
    });
}

// Função que calcula o total de uma linha
function calcularTotalLinha(linha) {
    const v = parseFloat(linha.querySelector('.valor').value.replace(',', '.')) || 0;
    const q = parseFloat(linha.querySelector('.qtd').value) || 0;
    const campoTotal = linha.querySelector('.total');
    
    if (campoTotal) {
        campoTotal.value = (v * q).toFixed(2);
    }
}

function controlaservico() {
    const tabela = document.getElementById('tabelaServicos');
    const linhas = tabela.querySelectorAll('tbody tr');

    if (linhas.length === 0) {
        alert("Informe pelo menos um serviço!");
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

// Função para adicionar linha automaticamente
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
        validarTabelaEmTempoReal(); // Força a verificação do botão ao criar linha nova
    }
}

function validarTabelaEmTempoReal() {
    const btnSalvar = document.getElementById('btnSalvar');    
    const tabelaVazia = checarTabelaVazia(); 
    //não permite salvar caso alguma coluna esteja em branco
    if (btnSalvar) {
        btnSalvar.disabled = tabelaVazia;
        btnSalvar.style.opacity = tabelaVazia ? "0.5" : "1";
        btnSalvar.style.cursor = tabelaVazia ? "not-allowed" : "pointer";
    }
}

// FUNÇÃO PARA SOMAR TODAS AS LINHAS NO TOTAL GERAL
function atualizarTotalGeral() {
    let somaGeral = 0;

    // Seleciona os totais da tabela
    const todosTotais = document.querySelectorAll('#tabelaServicos .linha-servico .total');

    todosTotais.forEach(campo => {
        const valorItem = parseFloat(campo.value) || 0;
        somaGeral += valorItem;      
    });

    // Captura dos elementos do HTML
    const vlTotalGeral = document.getElementById('vlTotGeral');
    const vltotPendBaixa = document.getElementById('vlTotPend');
    const vlTotPago = document.getElementById('vlTotFat');

    
    // Captura o valor já faturado/pago (converte para número decimal)
    const valorPago = vlTotPago ? parseFloat(vlTotPago.value.replace(',', '.')) || 0 : 0;

    // Calcula o valor pendente 
    const valorPendente = somaGeral - valorPago;

    // Atualiza os campos na tela - Totais Geral
    if (vlTotalGeral) {
        vlTotalGeral.value = somaGeral.toFixed(2);
    }

    if (vltotPendBaixa) {
        vltotPendBaixa.value = valorPendente.toFixed(2);
    }    
    
    
}




//FUNÇÃO PARA EXIBIR OS DADOS NA TELA
let idxOrdServ = 0; 

function mudarCadastro(direcao) {
    const tabela = JSON.parse(localStorage.getItem("ordServ")) || [];
    
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
//FUNÇÃO PARA SALVAR A ORDEM
function salvarOrdemServ() {
    const nmCliente = document.getElementById('nmCliente');

    //Não permite salvar a ordem sem um cliente selecionado
    if (!nmCliente?.value.trim()) {
        alert("Informe o Cliente!");
        return false;
    }

    //TESTA PARA SABER SE TEM LINHAS NA TABELA 
    if (controlaservico()) { 
       return false; 
    }

    try {
        const ordServ = JSON.parse(localStorage.getItem('ordServ')) || [];
        const nrServico = document.getElementById('nrServico').value;

        // Captura itens e remove linhas que não tenham descrição OU que o total seja "0.00"
        const itens = Array.from(document.querySelectorAll('.linha-servico'))
            .map(linha => ({
                descricao: linha.querySelector('.descProd').value.trim(),
                valor: linha.querySelector('.valor').value,
                qtd: bridge = linha.querySelector('.qtd').value,
                total: linha.querySelector('.total').value,
                data: linha.querySelector('.data-servico').value
            }))
            .filter(item => item.descricao !== "" && item.total !== "0.00" && item.total !== ""); 

        // Busca se já existe essa ordem para preservar dados de baixas/pagamentos
        const index = ordServ.findIndex(os => os.codigo === nrServico);
        const ordemExistente = index !== -1 ? ordServ[index] : null;

        const novaOrdem = {
            //Dados gerais
            dataRegistro: ordemExistente ? ordemExistente.dataRegistro : new Date().toISOString(), 
            codigo: nrServico,
            data: document.getElementById('dataServ').value,
            condPgto: document.getElementById('condPgto').value,
            cliente: nmCliente.value,

            //Linhas da ordem de serviço, tabela 
            itens: itens,

            //Aba3 - Dados do Cliente 
            endCli: document.getElementById('endCli').value,
            endNr: document.getElementById('endNr').value,
            endCidade: document.getElementById('endCidade').value,
            endUF: document.getElementById('endUf').value,
            cnpj: document.getElementById('cnpj').value,
            foneCli: document.getElementById('fone').value,

            //Totais e observação da ordem
            vlTotGeral: document.getElementById('vlTotGeral').value,            
            obs: document.getElementById('obs').value,
            vlTotPend: document.getElementById('vlTotPend').value,

            //  PRESERVAÇÃO DE DADOS DA ABA BAIXAS ---
            status: ordemExistente ? ordemExistente.status : "ABERTO",
            valorPagoAcumulado: ordemExistente ? ordemExistente.valorPagoAcumulado : 0,
            historicoPagamentos: ordemExistente ? ordemExistente.historicoPagamentos : []
        };

        // Se for edição, também recalcula o status baseado no novo valor total geral
        if (ordemExistente) {
            const novoTotal = parseFloat(novaOrdem.vlTotGeral) || 0;
            if (novaOrdem.valorPagoAcumulado >= novoTotal && novoTotal > 0) {
                novaOrdem.status = "PAGO";
            } else if (novaOrdem.valorPagoAcumulado > 0) {
                novaOrdem.status = "PENDENTE";
            } else {
                novaOrdem.status = "ABERTO";
            }
            // Recalcula o valor pendente no objeto que vai para o LocalStorage
            novaOrdem.vlTotPend = (novoTotal - novaOrdem.valorPagoAcumulado).toFixed(2);
        }

        // Salva ou atualiza no array
        if (index !== -1) {
            ordServ[index] = novaOrdem; // Atualiza a existente
        } else {
            ordServ.push(novaOrdem); // Adiciona nova
        }

        localStorage.setItem('ordServ', JSON.stringify(ordServ));
        alert("Ordem de Serviço salva com sucesso!");               
        limparOrdem();      
        return true;

    } catch (error) {
        console.error("Erro ao salvar no localStorage:", error);
        alert("Erro ao salvar os dados.");
        return false;
    }
}

//Mostra os dados na tela
function exibirDados() {
    const tabela = JSON.parse(localStorage.getItem("ordServ")) || [];    
    const contador = document.getElementById('contador');

    if (tabela.length === 0) {
        console.log("Nenhum cadastro encontrado.");
        if (contador) contador.innerText = "0 / 0";
        // Limpa o histórico caso não haja nenhuma ordem
        if (typeof atualizarTabelaHistorico === 'function') atualizarTabelaHistorico(null);
        return;
    }

    if (idxOrdServ >= tabela.length) idxOrdServ = 0;
    if (idxOrdServ < 0) idxOrdServ = tabela.length - 1;

    const ordem = tabela[idxOrdServ];

    // Campos gerais
    document.getElementById('nrServico').value = ordem.codigo || "";
    document.getElementById('condPgto').value = ordem.condPgto || "";
    document.getElementById('dataServ').value = ordem.data || "";

    // Aba3 - Dados do Cliente 
    document.getElementById('nmCliente').value = ordem.cliente || "";
    document.getElementById('endCli').value = ordem.endCli || "";
    document.getElementById('endNr').value = ordem.endNr || "";
    document.getElementById('endCidade').value = ordem.endCidade || "";
    document.getElementById('endUf').value = ordem.endUF || "";
    document.getElementById('cnpj').value = ordem.cnpj || "";
    document.getElementById('fone').value = ordem.foneCli || "";

    // Totais e observação da ordem    
    document.getElementById('vlTotGeral').value = ordem.vlTotGeral || "0.00";
    document.getElementById('vlTotPend').value = ordem.vlTotPend || "0.00";
    document.getElementById('obs').value = ordem.obs || "";

    // --- SINCRONIZAÇÃO DOS CAMPOS DA ABA DE BAIXAS ---
    const vlTotPago = document.getElementById('vlTotFat');
    if (vlTotPago) {
        vlTotPago.value = (ordem.valorPagoAcumulado || 0).toFixed(2);
    }

    // Atualiza os saldos calculados das abas na tela
    if (typeof atualizarTotalGeral === 'function') {
        atualizarTotalGeral();
    }

    // ITENS DA TABELA SERVIÇOS (CORREGIDO: Removido o 'vlTotPend' quebrado do final)
    if (typeof renderizarItensOrdem === 'function') {
        renderizarItensOrdem(ordem.itens);
    }

    if (contador) {
        contador.innerText = `${idxOrdServ + 1} de ${tabela.length}`;
    }

    // HISTÓRICO DE BAIXAS (CORREGIDO: Passando o objeto 'ordem' completo em vez de apenas o código)
    if (typeof atualizarTabelaHistorico === 'function') {
        atualizarTabelaHistorico(ordem);
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
                <td><input type="date" class="data-servico" value="${item.data}"></td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    
}

//FUNÇÃO PARA BAIXAR PARCIALMENTE A ORDEM---ABA BAIXAS
function baixarOrdem() {
    try {
        // CAPTURA OS VALORES DIRETAMENTE DA TELA ---
        const inputNrServico = document.getElementById('nrServico');
        const inputValorPago = document.getElementById('vlPago'); 

        if (!inputNrServico || !inputValorPago) {
            alert("Erro: Elementos da tela não foram encontrados!");
            return false;
        }

        const nrServicoDigitado = String(inputNrServico.value).trim();
        const valorPagoDigitado = inputValorPago.value;

        if (!nrServicoDigitado) {
            alert("Por favor, informe o número da Ordem de Serviço!");
            return false;
        }

        let ordServ = JSON.parse(localStorage.getItem('ordServ')) || [];
        
        // --- CORREÇÃO: GARENTE COMPARAÇÃO EM STRING PARA EVITAR ERRO DE TIPO ---
        const index = ordServ.findIndex(os => String(os.codigo).trim() === nrServicoDigitado);
        console.log("Ordens no LocalStorage:", ordServ);

        if (index === -1) {
            alert(`Ordem de Serviço Nº ${nrServicoDigitado} não encontrada!`);
            return false;
        }

        let os = ordServ[index];

        // Inicializa campos caso não existam
        if (!os.valorPagoAcumulado) os.valorPagoAcumulado = 0;
        if (!os.historicoPagamentos) os.historicoPagamentos = [];

        // Converte e trata o valor pago que vem do input (aceita vírgula ou ponto)
        const valorParcela = parseFloat(String(valorPagoDigitado).replace(',', '.')) || 0;
        const totalGeral = parseFloat(os.vlTotGeral) || 0;

        if (valorParcela <= 0) {
            alert("Informe um valor de pagamento válido!");
            return false;
        }

        // Calcula saldo restante real considerando precisão decimal do JS
        const saldoRestante = parseFloat((totalGeral - os.valorPagoAcumulado).toFixed(2));
        if (valorParcela > saldoRestante) {
            alert(`Valor excede o saldo devedor! Saldo atual: R$ ${saldoRestante.toFixed(2).replace('.', ',')}`);
            return false;
        }

        // ATUALIZA OS DADOS
        os.valorPagoAcumulado = parseFloat((os.valorPagoAcumulado + valorParcela).toFixed(2));
        os.historicoPagamentos.push({
            data: new Date().toISOString(),
            valor: valorParcela
        });

        // ATUALIZA STATUS DA ORDEM
        if (os.valorPagoAcumulado >= totalGeral) {
            os.status = "PAGO";
        } else {
            os.status = "PENDENTE";
        }

        // SALVA DE VOLTA NO LocalStorage
        ordServ[index] = os;
        localStorage.setItem('ordServ', JSON.stringify(ordServ));

        // ATUALIZA A INTERFACE EM TEMPO REAL ---
        const vlTotPago = document.getElementById('vlTotFat');
        if (vlTotPago) {
            vlTotPago.value = os.valorPagoAcumulado.toFixed(2);
            atualizarTotalGeral(); 
        }

        // Limpa o campo de valor digitado após o sucesso
        inputValorPago.value = ""; 

        
        alert(`Baixa de R$ ${valorParcela.toFixed(2).replace('.', ',')} registrada com sucesso!`);
        return true;

    } catch (error) {
        console.error("Erro ao dar baixa:", error);
        return false;
    }
}

function limparOrdem() {
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
            <td><input class="total" type="text" readonly></td>
            <td><input class="data-servico" type="date"></td>

        `;
        
        tbody.appendChild(novaLinha);
    }
    

    if (typeof nrOS === "function") nrOS();
    document.getElementById('nmCliente')?.focus();

    // Limpa a tabela de histórico da tela
    atualizarTabelaHistorico(null);

        // Reset do número da OS e foco no primeiro campo
        if (typeof nrOS === "function") nrOS();
        document.getElementById('nmCliente')?.focus();
}

// FUNÇÃO PARA EXCLUIR ORDEM
function excluirOrdemServ() {
    // Captura o numero da ordem a ser excluida
    const campoNrOS = document.getElementById('nrServico');
    const valorOS = campoNrOS ? campoNrOS.value : "";

    if (!valorOS) {
        alert("Selecione uma ordem de serviço para excluir.");
        return;
    }

    // Confirmação do usuário
    if (!confirm(`Tem certeza que deseja excluir a OS nº ${valorOS}?`)) {
        return;
    }

    // Busca os dados atuais
    let ordServ = JSON.parse(localStorage.getItem('ordServ')) || [];

    // Filtra a lista mantendo apenas o que NÃO for o código informado
    const novaLista = ordServ.filter(ordem => ordem.codigo !== valorOS);

    // Verifica se algo foi removido de fato
    if (ordServ.length === novaLista.length) {
        alert("Ordem de serviço não encontrada no banco de dados.");
        return;
    }

    // Salva a nova lista e atualiza a tela
    localStorage.setItem('ordServ', JSON.stringify(novaLista));
    alert("Ordem de serviço excluída!");
    
    // 2. Limpa a tela após excluir
    limparOrdem();
    if (typeof exibirDados === "function") exibirDados();
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
    

// FUNÇÃO QUE GERA O PRÓXIMO NUMERO DA ORDEM DE SERVIÇO
function nrOS() {
    const valorBanco = localStorage.getItem('ordServ');
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
    
    const campo = document.getElementById('nrServico');
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


function atualizarTabelaHistorico(os) {
    const tbody = document.querySelector('#tabelaHistoricoBaixas tbody');
    if (!tbody) return;

    // Limpa o histórico anterior
    tbody.innerHTML = '';

     console.log(os)
    // Se a OS não tiver histórico ou ele estiver vazio, mostra uma linha informativa
    if (!os || !os.historicoPagamentos || os.historicoPagamentos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="2" style="padding: 8px; text-align: center; color: #888;">
                    Nenhum pagamento registrado para esta O.S.
                </td>
            </tr>
        `;
        return;
    }

    // Percorre o histórico e cria as linhas da tabela
    os.historicoPagamentos.forEach(pagto => {
        const linha = document.createElement('tr');
        
        // Formata a data do formato ISO para o padrão brasileiro (DD/MM/AAAA HH:MM)
        const dataFormatada = new Date(pagto.data).toLocaleString('pt-BR');
        
        // Formata o valor para moeda brasileira
        const valorFormatado = parseFloat(pagto.valor).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        linha.innerHTML = `
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${dataFormatada}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold; color: green;">${valorFormatado}</td>
        `;
        
        tbody.appendChild(linha);
    });
}
