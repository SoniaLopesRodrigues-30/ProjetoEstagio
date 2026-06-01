
//================================//
//=====EVENTOS INICIALIZAÇÃO=======//
document.addEventListener('DOMContentLoaded', () => {
   
    inicializarTabelaServicos();
    nrOS(); // Gera ou carrega o número da OS atual no formato "001"

    selecionaCliente('nmCliente', 'clientes');

    document.getElementById('tabelaServicos').addEventListener('input', function(event) {
        if (event.target.tagName === 'INPUT') {
            validarTabelaEmTempoReal(); 
        }
    }); 

    // BOTÃO SALVAR (Ajustado para evitar dupla validação)
    const btn = document.getElementById('btnSalvar');
    if (btn) {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); 
            salvarOrdemServ(); // A validação de linhas internas da tabela já ocorre aqui dentro
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



// FUNÇÕES GERAIS DA ORDEM DE SERVIÇO
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


//FUNÇÕES DA TABELA
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

//VERIFICA SE EXISTEM LINHAS PARCIALMENTE PREENCHIDAS 

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

//  ATIVA OU DESATIVA O BOTÃO SALVAR EM TEMPO REAL
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

// 5. GERENCIADOR ÚNICO DE MUDANÇAS NA TABELA
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
        validarTabelaEmTempoReal(); // Força a verificação do botão ao criar linha nova
    }
}


// SOMA OS TOTAIS
function atualizarTotalGeral(nrServico) {
    let somaGeral = 0;

    // Percorre a coluna de totais da tabela de serviços
    const todosTotais = document.querySelectorAll('#tabelaServicos .linha-servico .total');

    todosTotais.forEach(campo => {
        
        let textoValor = campo.value !== undefined ? campo.value : campo.textContent;
        
        // Remove espaços invisíveis e padroniza a vírgula para ponto decimal
        textoValor = textoValor.trim().replace(',', '.');
        
        // Converte o texto para número decimal e acumula na soma
        const valorItem = parseFloat(textoValor) || 0;
        somaGeral += valorItem;      
    });
   
}

function salvarOrdemServ() {
    const nmCliente = document.getElementById('nmCliente');

    // Não permite salvar a ordem sem um cliente selecionado
    if (!nmCliente?.value.trim()) {
        alert("Informe o Cliente!");
        return false;
    }

    // TESTA PARA SABER SE TEM LINHAS NA TABELA 
    if (controlaservico()) { 
       return false; 
    }

   
    const converterParaNumeroSeguro = (valorRaw) => {
        if (!valorRaw) return 0;
        let texto = String(valorRaw).trim();
        
        // Se contiver pontos de milhar e vírgula decimal (Ex: 1.500,50)
        if (texto.includes('.') && texto.includes(',')) {
            texto = texto.replace(/\./g, '').replace(',', '.');
        } 
        // Se contiver apenas vírgula como decimal (Ex: 1500,50)
        else if (texto.includes(',')) {
            texto = texto.replace(',', '.');
        }
        
        const numero = parseFloat(texto);
        return isNaN(numero) ? 0 : numero;
    };

    try {
        const ordServ = JSON.parse(localStorage.getItem('ordServ')) || [];
        const nrServico = document.getElementById('nrServico').value;

        // Captura e filtra os itens da tela
        const itensFiltrados = Array.from(document.querySelectorAll('.linha-servico'))
            .map(linha => {
                const descricao = linha.querySelector('.descProd')?.value?.trim() || "";
                const valor = linha.querySelector('.valor')?.value || "0";
                const qtd = linha.querySelector('.qtd')?.value || "0";
                const totalRaw = linha.querySelector('.total')?.value || "0";
                const data = linha.querySelector('.data-servico')?.value || "";

                // Usa a nova função ultra segura para não distorcer o valor
                const totalNumerico = converterParaNumeroSeguro(totalRaw);

                return {
                    descricao,
                    valor,
                    qtd,
                    total: totalRaw,
                    totalNumerico,
                    data
                };
            })
            .filter(item => item.descricao !== "" && item.totalNumerico > 0);

        // Executa a soma de todos os totais numéricos
        const somaGeral = itensFiltrados.reduce((acumulador, item) => acumulador + item.totalNumerico, 0);

        // Formata o Total Geral no padrão brasileiro nativo (Ex: 1.500,00)
        const somaGeralFormatada = somaGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Imprime o valor idêntico na tela
        const inputTotalGeral = document.getElementById('vlTotGeral');
        if (inputTotalGeral) {
            inputTotalGeral.value = somaGeralFormatada;
        }

        // Limpa a propriedade auxiliar dos itens antes de salvar
        const itensProntosParaSalvar = itensFiltrados.map(({ totalNumerico, ...resto }) => resto);
        
        // Busca se já existe essa ordem para preservar dados de baixas/pagamentos
        const index = ordServ.findIndex(os => os.codigo === nrServico);
        const ordemExistente = index !== -1 ? ordServ[index] : null;

        // Garante que não vai sobrescrever campos com vazio se as abas do cliente estiverem ocultas
        const obterValorValido = (idCampo, valorAntigo) => {
            const el = document.getElementById(idCampo);
            return el ? el.value : (valorAntigo || "");
        };

        // Resgata o valor acumulado já pago convertendo com segurança caso venha formatado
        const valorPagoAcumulado = ordemExistente ? converterParaNumeroSeguro(ordemExistente.valorPagoAcumulado) : 0;

        const novaOrdem = {
            dataRegistro: ordemExistente ? ordemExistente.dataRegistro : new Date().toISOString(), 
            codigo: nrServico,
            data: document.getElementById('dataServ').value,
            condPgto: document.getElementById('condPgto').value,
            cliente: nmCliente.value,
            itens: itensProntosParaSalvar,

            endCli: obterValorValido('endCli', ordemExistente?.endCli),
            endNr: obterValorValido('endNr', ordemExistente?.endNr),
            endCidade: obterValorValido('endCidade', ordemExistente?.endCidade),
            endUF: obterValorValido('endUf', ordemExistente?.endUF),
            cnpj: obterValorValido('cnpj', ordemExistente?.cnpj),
            foneCli: obterValorValido('fone', ordemExistente?.foneCli),

            vlTotGeral: somaGeralFormatada,            
            obs: obterValorValido('obs', ordemExistente?.obs),
            
            // Valores padrão que serão injetados de forma limpa abaixo
            vlTotPend: "0,00", 
            status: "PENDENTE",
            valorPagoAcumulado: valorPagoAcumulado,
            historicoPagamentos: ordemExistente ? ordemExistente.historicoPagamentos : []
        };

        
        const calculoPend = somaGeral - novaOrdem.valorPagoAcumulado;
        const valorPendLiquido = calculoPend > 0 ? parseFloat(calculoPend.toFixed(2)) : 0;

        // Atualiza a propriedade do JSON final já formatada
        novaOrdem.vlTotPend = valorPendLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Atualiza o Status baseado no cálculo numérico real
       if (novaOrdem.valorPagoAcumulado >= parseFloat(somaGeral.toFixed(2)) && somaGeral > 0) {
            novaOrdem.status = "FATURADO";
        } else { 
            // Se não atingiu o valor total (inclusive se for 0), o status será sempre PENDENTE
            novaOrdem.status = "PENDENTE";        
        }


        // Atualiza o texto da Label/Span na tela
        const campoStatus = document.getElementById('statusOrdem');
        if (campoStatus) {
            campoStatus.textContent = novaOrdem.status;
            
            // Altera as cores do texto dinamicamente
            if (novaOrdem.status === "FATURADO") campoStatus.style.color = "#2e7d32";             
            else campoStatus.style.color = "#c01515ff";                            
        }



        // Atualiza o input de pendência físico na tela para o usuário ver o reflexo
        const inputTotPend = document.getElementById('vlTotPend');
        if (inputTotPend) {
            inputTotPend.value = novaOrdem.vlTotPend;
        }

        // Salva ou atualiza no array do localStorage
        if (index !== -1) {
            ordServ[index] = novaOrdem;
            console.log("Ordem de serviço atualizada.");
        } else {
            ordServ.push(novaOrdem);
            console.log("Nova ordem de serviço criada.");
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
    
    // Limpa a tela após excluir
    limparOrdem();
    if (typeof exibirDados === "function") exibirDados();
}



//FAZ A MOVIMENTAÇÃO DOS DADOS NA TELA
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

    exibirDados(idxOrdServ); 
}

//FUNÇÃO PARA EXIBIR OS DADOS NA TELA
function exibirDados() {
    const tabela = JSON.parse(localStorage.getItem("ordServ")) || [];    
    const contador = document.getElementById('contador');

    if (tabela.length === 0) {
        
        if (contador) contador.innerText = "0 / 0";
        // Limpa o histórico caso não haja nenhuma ordem
        if (typeof atualizarTabelaHistorico === 'function') atualizarTabelaHistorico(null);
        return;
    }

    if (idxOrdServ >= tabela.length) idxOrdServ = 0;
    if (idxOrdServ < 0) idxOrdServ = tabela.length - 1;

    const ordem = tabela[idxOrdServ];
    //STATUS DA ORDEM
    document.getElementById('statusOrdem').value= ordem.status || "";

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
        atualizarTotalGeral(ordem);
    }


    // ITENS DA TABELA SERVIÇOS 
    if (typeof renderizarItensOrdem === 'function') {
        renderizarItensOrdem(ordem.itens);
    }

    if (contador) {
        contador.innerText = `${idxOrdServ + 1} de ${tabela.length}`;
    }

    // HISTÓRICO DE BAIXAS 
    if (typeof atualizarTabelaHistorico === 'function') {
        atualizarTabelaHistorico(ordem);
    }
}


// RECONSTROI A TABELA A CADA ATUALIZAÇÃO DA TELA
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

// FUNÇÃO PARA BAIXAR PARCIALMENTE A ORDEM---ABA BAIXAS
function baixarOrdem() {
    // [FUNÇÃO DE SANITIZAÇÃO] Converte valores com ponto/vírgula formatados de forma segura
    const converterParaNumeroSeguro = (valorRaw) => {
        if (!valorRaw) return 0;
        let texto = String(valorRaw).trim();
        if (texto.includes('.') && texto.includes(',')) {
            texto = texto.replace(/\./g, '').replace(',', '.');
        } else if (texto.includes(',')) {
            texto = texto.replace(',', '.');
        }
        const numero = parseFloat(texto);
        return isNaN(numero) ? 0 : numero;
    };

    try {
        
        const inputNrServico = document.getElementById('nrServico');
        const inputVlPago = document.getElementById('vlPago');     
        
        if (!inputNrServico || !inputNrServico.value.trim()) {
            alert("Por favor, informe o número da Ordem de Serviço!");
            return false;
        }

        
        const codigoBuscado = inputNrServico.value.trim();
        let ordServ = JSON.parse(localStorage.getItem('ordServ')) || [];
        
        
        const index = ordServ.findIndex(os => String(os.codigo).trim() === codigoBuscado);
        
        if (index === -1) {
            alert(`Ordem de Serviço Nº ${codigoBuscado} não encontrada!`);
            return false;
        }

        let os = ordServ[index];

        // Inicializa campos caso não existam no registro antigo
        if (!os.valorPagoAcumulado) os.valorPagoAcumulado = 0;
        if (!os.historicoPagamentos) os.historicoPagamentos = [];

        
        const valorParcela = converterParaNumeroSeguro(inputVlPago?.value);
        const totalGeral = converterParaNumeroSeguro(os.vlTotGeral);

        if (valorParcela <= 0) {
            alert("Informe um valor de pagamento válido!");
            return false;
        }

        
        const saldoRestante = parseFloat((totalGeral - os.valorPagoAcumulado).toFixed(2));
        if (valorParcela > saldoRestante) {
            alert(`Valor excede o saldo devedor! Saldo atual: R$ ${saldoRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
            return false;
        }
      
        // ATUALIZA OS DADOS DA ORDEM
        os.valorPagoAcumulado = parseFloat((os.valorPagoAcumulado + valorParcela).toFixed(2));
        os.historicoPagamentos.push({
            data: new Date().toISOString(),
            valor: valorParcela
        });

        // RECALCULA O NOVO SALDO PENDENTE MATEMÁTICO
        const novoSaldoPend = parseFloat((totalGeral - os.valorPagoAcumulado).toFixed(2));
        // Guarda no objeto sempre formatado em PT-BR para exibição uniforme
        os.vlTotPend = (novoSaldoPend > 0 ? novoSaldoPend : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // ATUALIZA STATUS DA ORDEM COM ARREDONDAMENTO DE SEGURANÇA
        if (os.valorPagoAcumulado >= parseFloat(totalGeral.toFixed(2))) {
            os.status = "PAGO";
        } else if (os.valorPagoAcumulado > 0) {
            os.status = "PENDENTE";
        } else {
            os.status = "ABERTO";
        }

        // SALVA DE VOLTA NO LocalStorage
        ordServ[index] = os;
        localStorage.setItem('ordServ', JSON.stringify(ordServ));

        // --- ATUALIZA A INTERFACE EM TEMPO REAL ---
        
        // Atualiza o campo do valor faturado acumulado na tela
        const vlTotPago = document.getElementById('vlTotFat');
        if (vlTotPago) {
            vlTotPago.value = os.valorPagoAcumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        // Atualiza o input físico do valor pendente na tela para refletir a baixa imediatamente
        const inputTotPend = document.getElementById('vlTotPend');
        if (inputTotPend) {
            inputTotPend.value = os.vlTotPend;
        }

        // Recalcula os valores gerais do formulário se a função existir
        if (typeof atualizarTotalGeral === 'function') {
            atualizarTotalGeral(); 
        }

        // Atualiza a tabela visual de histórico com a nova parcela
        if (typeof atualizarTabelaHistorico === 'function') {
            atualizarTabelaHistorico(os);
        }

        //Limpa o campo de valor digitado 
        if (inputVlPago) {
            inputVlPago.value = ""; 
        }

        alert(`Baixa de R$ ${valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} registrada com sucesso!`);
        return true;

    } catch (error) {
        console.error("Erro ao dar baixa:", error);
        alert("Ocorreu um erro ao processar a baixa. Verifique o console.");
        return false;
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
//ATUALIZA O HISTÓRICO DAS BAIXAS DA ORDEM
function atualizarTabelaHistorico(os) {
    const tbody = document.querySelector('#tabelaHistoricoBaixas tbody');
    if (!tbody) return;

    // Limpa o histórico anterior
    tbody.innerHTML = ''; 
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
