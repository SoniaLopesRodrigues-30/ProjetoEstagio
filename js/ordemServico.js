document.addEventListener('DOMContentLoaded', () => {
    inicializarTabelaServicos();
    nrOS();

    document.getElementById('tabelaServicos').addEventListener('input', function(event) {
    // Verifica se o que mudou foi realmente um input
    if (event.target.tagName === 'INPUT') {
        validarTabelaEmTempoReal();
    }
});

});


// FUNÇÕES DA ORDEM DE SERVIÇO
function inicializarTabelaServicos() {
    const tabela = document.querySelector('#tabelaServicos');
    if (!tabela) return;

    tabela.addEventListener('input', function(e) {
        const target = e.target;
        const linha = target.closest('tr');

        // Lógica de Cálculo de Preço
        if (target.classList.contains('valor') || target.classList.contains('qtd')) {
            calcularTotalLinha(linha);
            atualizarTotalGeral();
        }

        // Adicionar Nova Linha
        if (target.classList.contains('data-servico')) {
            verificarEAdicionarLinha(target, linha);
        }
    });
}

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
function controlaservico() {
    const nrLinhasServico = document.getElementById('tabelaServicos').rows;

    // Verifica se a tabela tem linhas de dados
    if (nrLinhasServico.length <= 1) {
        alert("Informe pelo menos um serviço!");
        return true;
    }

    // Percorre cada LINHA
    for (let i = 1; i < nrLinhasServico.length; i++) {
        const inputs = nrLinhasServico[i].querySelectorAll('input');

        // Percorre cada coluna da linha atual
        for (let input of inputs) {
            // Se encontrar QUALQUER coluna vazia, barra o salvamento
            if (input.value.trim() === "") {
                alert("Atenção: Existem colunas não preenchidas na linha " + i + "!");
                input.focus(); // Coloca o cursor no campo vazio para ajudar o usuário
                return true; 
            }
        }
    }

    return false; 
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

//VERIFICA SE TODAS AS COLUNAS ESTÃO PREENCHIDAS
function checarTabelaVazia() {
    const rows = document.getElementById('tabelaServicos').rows;
    if (rows.length <= 1) return true;

    for (let i = 1; i < rows.length; i++) {
        // Pega todos os inputs da linha atual
        const inputs = rows[i].querySelectorAll('input');
        for (let input of inputs) {
            if (input.value.trim() !== "") {
                return false; 
            }
        }
    }
    return true; //CADO CHEGUE AQUI A TABELA ESTÁ VAZIA NÃO DEIXARA SALVAR
}



// Função para adicionar linha automaticamente
function verificarEAdicionarLinha(inputData, linhaAtual) {
    const tbody = inputData.closest('tbody');
    const linhas = tbody.getElementsByClassName('linha-servico');
    const ultimaLinha = linhas[linhas.length - 1];

    if (linhaAtual === ultimaLinha && inputData.value !== "") {
        const novaLinha = ultimaLinha.cloneNode(true);
        // Limpa os valores dos inputs da nova linha
        novaLinha.querySelectorAll('input').forEach(input => input.value = "");
        tbody.appendChild(novaLinha);
    }
}

// 4. Função para somar todos os totais
function atualizarTotalGeral() {
    let soma = 0;
    document.querySelectorAll('.total').forEach(input => {
        soma += parseFloat(input.value) || 0;
    });
    
    const campoTotalGeral = document.getElementById('id_total_geral');
    if (campoTotalGeral) campoTotalGeral.value = soma.toFixed(2);
}


// FUNÇÃO PARA SOMAR TODAS AS LINHAS NO TOTAL GERAL
function atualizarTotalGeral() {
    const todosTotais = document.querySelectorAll('.total');
    let somaGeral = 0;
    let somaPendente=0;
    let somaFaturado=0

    
    todosTotais.forEach(campo => {
        somaGeral += parseFloat(campo.value) || 0;
        somaPendente += parseFloat(campo.value) || 0;
        somaFaturado += parseFloat(campo.value) || 0;
    });

    const vlTotalGeral = document.getElementById('vlTotGeral');
    if (vlTotalGeral) {
        vlTotalGeral.value = somaGeral.toFixed(2);
    }    
    
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
       return; 
    }

    try {
        const ordServ = JSON.parse(localStorage.getItem('ordServ')) || [];
        const nrServico = document.getElementById('nrServico').value;

        // Captura itens e remove linhas que não tenham descrição OU que o total seja "0.00"
        const itens = Array.from(document.querySelectorAll('.linha-servico'))
            .map(linha => ({
                descricao: linha.querySelector('.descProd').value.trim(),
                valor: linha.querySelector('.valor').value,
                qtd: linha.querySelector('.qtd').value,
                total: linha.querySelector('.total').value,
                data: linha.querySelector('.data-servico').value
            }))
            .filter(item => item.descricao !== "" && item.total !== "0.00" && item.total !== ""); 

        const novaOrdem = {
            codigo: nrServico,
            data: document.getElementById('dataServ').value,
            condPgto: document.getElementById('condPgto').value,
            cliente: nmCliente.value,
            endCli: document.getElementById('endCli').value,
            endNr: document.getElementById('endNr').value,
            endCidade: document.getElementById('endCidade').value,
            endUF: document.getElementById('endUf').value,
            cnpj: document.getElementById('cnpj').value,
            foneCli: document.getElementById('fone').value,
            itens: itens,
            vlTotGeral: document.getElementById('vlTotGeral').value,
            obs: document.getElementById('obs').value,
            dataRegistro: new Date().toISOString() 
        };

        // Verifica se é uma edição ou nova ordem
        const index = ordServ.findIndex(os => os.codigo === nrServico);
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



function exibirDados() {
    const tabela = JSON.parse(localStorage.getItem("ordServ")) || [];    
    const contador = document.getElementById('contador');

    if (tabela.length === 0) {
        console.log("Nenhum cadastro encontrado.");
        if (contador) contador.innerText = "0 / 0";
        return;
    }

    if (idxOrdServ >= tabela.length) idxOrdServ = 0;
    if (idxOrdServ < 0) idxOrdServ = tabela.length - 1;

    const ordem = tabela[idxOrdServ];

    // PREENCHE OS CAMPOS PRINCIPAIS
    document.getElementById('nrServico').value = ordem.codigo || "";
    document.getElementById('condPgto').value= ordem.condPgto || "";
    document.getElementById('dataServ').value = ordem.data || "";
    document.getElementById('nmCliente').value = ordem.cliente || "";
    document.getElementById('endCli').value = ordem.endCli || "";
    document.getElementById('endNr').value = ordem.endNr || "";
    document.getElementById('endCidade').value = ordem.endCidade || "";
    document.getElementById('endUf').value = ordem.endUF || "";
    document.getElementById('cnpj').value = ordem.cnpj || "";
    document.getElementById('fone').value = ordem.foneCli || "";
    document.getElementById('vlTotGeral').value = ordem.vlTotGeral || "";
    document.getElementById('obs').value = ordem.obs || "";

    // ITENS DA TABELA SERVIÇOS
    renderizarItensOrdem(ordem.itens);

    if (contador) {
        contador.innerText = `${idxOrdServ + 1} de ${tabela.length}`;
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
function baixarOrdem(nrServico, valorPago) {
    try {
        let ordServ = JSON.parse(localStorage.getItem('ordServ')) || [];
        const index = ordServ.findIndex(os => os.codigo === nrServico);

        if (index === -1) {
            alert("Ordem de Serviço não encontrada!");
            return;
        }

        let os = ordServ[index];

        // PEGA VALORES JÁ BAIXADOS PARA ORDEM ATUAL, SE NÃO TIVER NADA FICA 0
        if (!os.valorPagoAcumulado) os.valorPagoAcumulado = 0;
        if (!os.historicoPagamentos) os.historicoPagamentos = [];

        // CONVERTE PARA VALORES
        const valorParcela = parseFloat(valorPago);
        const totalGeral = parseFloat(os.vlTotGeral);

        if (isNaN(valorParcela) || valorParcela <= 0) {
            alert("Informe um valor de pagamento válido!");
            return;
        }

        // VERIFICA SE O VALOR INFORMADO PARA BAIXA NÃO É MAIOR QUE O TOTAL DA ORDEM
        const saldoRestante = totalGeral - os.valorPagoAcumulado;
        if (valorParcela > saldoRestante) {
            alert(`Valor excede o saldo devedor! Saldo atual: R$ ${saldoRestante.toFixed(2)}`);
            return;
        }

        // ATUALIZA OS DADOS
        os.valorPagoAcumulado += valorParcela;
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

        // SALVA DE VOLTA NO  LocalStorage
        ordServ[index] = os;
        localStorage.setItem('ordServ', JSON.stringify(ordServ));

        alert(`Baixa de R$ ${valorParcela.toFixed(2)} registrada com sucesso!`);
        return true;

    } catch (error) {
        console.error("Erro ao dar baixa:", error);
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
    
    // 4. Reset do número da OS e foco no primeiro campo
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


document.addEventListener('DOMContentLoaded', function() {
    //SALVAR
    const btn = document.getElementById('btnSalvar');
    if (btn) {
        btn.addEventListener('click', salvarOrdemServ);
    }

    //BAIXAR VALOR
    const baixa = document.getElementById('btnBaixar');
    if (baixa) {
        baixa.addEventListener('click', baixarOrdem);
    }

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

   //LIMPAR A TABELA --- 
   limparOrdem()
   const limpar =document.getElementById('btnNovo')
   if (limpar) {
        // limpa a tela
        limpar.addEventListener('click', () => limparOrdem());
    } 
   

   //EXCLUIR CADASTRO---
   const excluir=document.getElementById('btnCancelar')
    if (excluir) {
        // excluir o cadastro
        const nrOrdem = document.getElementById("nrServico")
        excluir.addEventListener('click', () => excluirOrdemServ(nrOrdem));
    } 
   

});


//  EVENTO DE SUBMIT
const formOrdServ = document.getElementById('formOrdServ');
formOrdServ.addEventListener('submit', (e) => {
    e.preventDefault();     
    
    if (salvarOrdemServ()) {
      return true
    }
});

   
// QUANDO DIGITO O NOME DO CLIENTE
document.addEventListener('DOMContentLoaded', () => {
    selecionaCliente('nmCliente', 'clientes');
});



// -/-/-/- troca de aba -/-/-/- //
function trocarAba(index) {
    const abas = document.querySelectorAll(".btn-aba");
    const conteudos = document.querySelectorAll(".aba");

    abas.forEach(aba => aba.classList.remove("ativa"));
    conteudos.forEach(c => c.classList.remove("ativa"));

    abas[index].classList.add("ativa");
    conteudos[index].classList.add("ativa");
}

//chama algumas funções ao abrir a página
document.addEventListener("DOMContentLoaded", function() {
  nrOS()   
})