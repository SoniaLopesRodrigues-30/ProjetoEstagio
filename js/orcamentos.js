

document.addEventListener('DOMContentLoaded', () => {
    
    // Inicializações padrão
    inicializarTabelaServicos();
    nrOrc();
    
    const tabelaServicos = document.getElementById('tabelaServicos');
    if (tabelaServicos) {
        tabelaServicos.addEventListener('input', function(event) {
            if (event.target.tagName === 'INPUT') {
                validarTabelaEmTempoReal();
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
        if (target.classList.contains('data-servico')) {
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


//  Função que calcula o total de uma linha
function calcularTotalLinha(linha) {
   
    const v = parseFloat(linha.querySelector('.valor').value.replace(',', '.')) || 0;
    const q = parseFloat(linha.querySelector('.qtd').value) || 0;
    const campoTotal = linha.querySelector('.total');
    
    if (campoTotal) {
        campoTotal.value = (v * q).toFixed(2);
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
    return true; //CASO CHEGUE AQUI A TABELA ESTÁ VAZIA NÃO DEIXARA SALVAR
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



// FUNÇÃO PARA SOMAR TODAS AS LINHAS NO TOTAL GERAL
function atualizarTotalGeral() {
    
    const todosTotais = document.querySelectorAll('.resumo');
    let somaGeral = 0;    
    todosTotais.forEach(campo => {
        somaGeral += parseFloat(campo.value) || 0;       
    });

    // Total geral fora da aba
    const vlTotalGeral = document.getElementById('vlTotGeral');
    
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
            codigo: nrOrc,
            data: document.getElementById('dataOrc')?.value || "",
            condPgto: document.getElementById('condPgto')?.value || "",
            cliente: nmCliente.value,
            endCli: document.getElementById('endCli')?.value || "",
            endNr: document.getElementById('endNr')?.value || "",
            endCidade: document.getElementById('endCidade')?.value || "",
            endUF: document.getElementById('endUf')?.value || "",
            cnpj: document.getElementById('cnpj')?.value || "",
            foneCli: document.getElementById('fone')?.value || "",
            itens: itens,
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

    // PREENCHE OS CAMPOS PRINCIPAIS
    document.getElementById('nrOrc').value = ordem.codigo || "";
    document.getElementById('condPgto').value= ordem.condPgto || "";
    document.getElementById('dataOrc').value = ordem.data || "";
    document.getElementById('nmCliente').value = ordem.cliente || "";
    document.getElementById('endCli').value = ordem.endCli || "";
    document.getElementById('endNr').value = ordem.endNr || "";
    document.getElementById('endCidade').value = ordem.endCidade || "";
    document.getElementById('endUf').value = ordem.endUF || "";
    document.getElementById('cnpj').value = ordem.cnpj || "";
    document.getElementById('fone').value = ordem.foneCli || "";
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


// FUNÇÃO QUE GERA O PRÓXIMO NUMERO DA ORDEM DE SERVIÇO
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


