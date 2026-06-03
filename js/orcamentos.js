//================================//
//=====EVENTOS INICIALIZAÇÃO=======//
let idxOrc = 0; // Controla o índice do orçamento ativo na paginação

// Atalhos utilitários para manipulação do DOM e Banco de Dados (LocalStorage)
const $ = (id) => document.getElementById(id);
const $val = (id, defaultVal = "") => $(id)?.value || defaultVal;
const getBD = (chave) => JSON.parse(localStorage.getItem(chave) || '[]');
const setBD = (chave, dados) => localStorage.setItem(chave, JSON.stringify(dados));

document.addEventListener('DOMContentLoaded', () => {
    inicializarTabelaServicos();
    nrOrc();
    selecionaCliente('nmCliente', 'clientes');

    // Mapeamento centralizado de gatilhos para botões do formulário
    const gatilhosBotoes = {
        'btnSalvar': (e) => { e.preventDefault(); if (!controlaservico()) salvarOrcamento(); },
        'btnAnterior': () => mudarCadastro(-1),
        'btnProximo': () => mudarCadastro(1),
        'btnNovo': (e) => { e.preventDefault(); limparOrc(); },
        'btnCancelar': (e) => { e.preventDefault(); excluirOrc(); },
        'btnGerarOS': converterOrcamentoEmOrdemServico
    };

    Object.entries(gatilhosBotoes).forEach(([id, acao]) => {
        $(id)?.addEventListener('click', acao);
    });

    // Mapeamento centralizado para cliques de navegação das Abas
    const abas = { 'aba-servicos': 0, 'aba-cliente': 1, 'aba-orcamento': 2 };
    Object.entries(abas).forEach(([id, index]) => {
        $(id)?.addEventListener('click', () => trocarAba(index));
    });

    validarTabelaEmTempoReal();
});
function inicializarTabelaServicos() {
    const tabela = $('tabelaServicos');
    if (!tabela) return;

    // Gerenciador único unificado (evita loops de eventos duplicados)
    tabela.addEventListener('input', (e) => {
        const tgt = e.target;
        if (tgt.tagName !== 'INPUT') return;

        const linha = tgt.closest('tr');
        if (!linha) return;

        // Multiplicação automática ao alterar Valor ou Quantidade
        if (tgt.classList.contains('valor') || tgt.classList.contains('qtd')) {
            const v = parseFloat(linha.querySelector('.valor')?.value.replace(',', '.')) || 0;
            const q = parseFloat(linha.querySelector('.qtd')?.value) || 0;
            const campoTotal = linha.querySelector('.total');
            if (campoTotal) campoTotal.value = (v * q).toFixed(2);
            atualizarTotalGeral();
        }

        // Criação reativa de novas linhas ao preencher a linha atual
        if (tgt.classList.contains('data-servico') || tgt.classList.contains('qtd') || tgt.classList.contains('descProd')) {
            verificarEAdicionarLinha(tgt, linha);
        }

        validarTabelaEmTempoReal();
    });
}

function atualizarTotalGeral() {
    let somaGeral = 0;    
    document.querySelectorAll('#tabelaServicos tbody .total').forEach(campo => {
        somaGeral += parseFloat(campo.value) || 0;       
    });
    if ($('vlTotGeral')) $('vlTotGeral').value = somaGeral.toFixed(2);
}
function controlaservico() {
    const linhas = document.querySelectorAll('#tabelaServicos tbody tr');
    if (linhas.length === 0) return alert("Informe pelo menos um serviço ou produto!") || true;

    for (const [index, linha] of linhas.entries()) {
        const inputs = linha.querySelectorAll('input:not([type="hidden"]):not([disabled])');
        if (inputs.length === 0) continue; 

        const primeiroCampoPreenchido = inputs[0].value.trim() !== "";

        if (index === 0 || primeiroCampoPreenchido) {
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

function validarTabelaEmTempoReal() {
    const btn = $('btnSalvar');    
    if (!btn) return;
    
    const linhas = document.querySelectorAll('#tabelaServicos tbody tr');
    let vazia = linhas.length === 0;
    
    if (linhas.length === 1) {
        const inputs = linhas[0].querySelectorAll('input:not(.total)');
        vazia = Array.from(inputs).every(input => !input.value.trim());
    }
    
    btn.disabled = vazia;
    btn.style.opacity = vazia ? "0.5" : "1";
    btn.style.cursor = vazia ? "not-allowed" : "pointer";
}

function trocarAba(index) {
    const abas = document.querySelectorAll(".btn-aba");
    const conteudos = document.querySelectorAll(".aba");
    if (!abas[index] || !conteudos[index]) return;

    abas.forEach(aba => aba.classList.remove("ativa"));
    conteudos.forEach(c => c.classList.remove("ativa"));

    abas[index].classList.add("ativa");
    conteudos[index].classList.add("ativa");
}
function salvarOrcamento() {
    if (!$val('nmCliente').trim()) return alert("Informe o Cliente!") || false;

    try {
        const orc = getBD('orcamentos');
        const nrOrcAtual = $val('nrOrc');

        const itens = Array.from(document.querySelectorAll('#tabelaServicos tbody tr')).map(linha => ({
            descricao: linha.querySelector('.descProd')?.value.trim() || "",
            valor: linha.querySelector('.valor')?.value || "0.00",
            qtd: linha.querySelector('.qtd')?.value || "0",
            total: linha.querySelector('.total')?.value || "0.00"                
        })).filter(item => item.descricao !== "");

        const novoOrcamento = {
            codigo: nrOrcAtual,
            data: $val('dataOrc'),
            condPgto: $val('condPgto'),
            cliente: $val('nmCliente'),
            itens: itens,
            vlTotGeral: $val('vlTotGeral', '0.00'),
            obs: $val('obs'),
            status: "Aberto", // Status inicial padrão
            dataRegistro: new Date().toISOString() 
        };

        const camposCliente = ['endCli', 'endNr', 'endCidade', 'endUf', 'cnpj', 'fone'];
        camposCliente.forEach(id => {
            const prop = id === 'fone' ? 'foneCli' : (id === 'endUf' ? 'endUF' : id);
            novoOrcamento[prop] = $val(id);
        });

        const index = orc.findIndex(o => String(o.codigo).trim() === String(nrOrcAtual).trim());
        if (index !== -1) {
            novoOrcamento.status = orc[index].status || "Aberto"; // Preserva status em edições
            novoOrcamento.osGerada = orc[index].osGerada || null;
            orc[index] = novoOrcamento;
        } else {
            orc.push(novoOrcamento);
        }

        setBD('orcamentos', orc);
        alert("Orçamento salvo com sucesso!");               
        limparOrc();      
        return true;
    } catch (error) {
        return console.error("Erro ao salvar:", error) || alert("Erro ao salvar os dados.") || false;
    }
}

function converterOrcamentoEmOrdemServico() {
    const nrOrc = $val('nrOrc').trim();
    if (!nrOrc) return alert("Por favor, selecione ou salve um orçamento antes de transformá-lo em O.S.");

    const listaOrcamentos = getBD('orcamentos');
    const orcamento = listaOrcamentos.find(o => String(o.codigo).trim() === nrOrc);
    if (!orcamento) return alert(`O orçamento nº ${nrOrc} precisa estar salvo para ser convertido.`);

    if (orcamento.status === "Convertido") return alert(`Este orçamento já foi convertido na O.S. nº ${orcamento.osGerada || ''}.`);
    if (!confirm(`Deseja converter o Orçamento nº ${nrOrc} em uma Ordem de Serviço definitiva?`)) return;

    try {
        const listaOS = getBD('ordServ');
        const proximoNumero = listaOS.length > 0 ? Math.max(...listaOS.map(os => parseInt(os.codigo) || 0)) + 1 : 1;
        const novoCodigoOS = String(proximoNumero).padStart(3, '0');    
        const dataAtual = new Date().toISOString().split('T')[0]; 

        const novaOS = {
            ...orcamento,
            codigo: novoCodigoOS,
            status: "PENDENTE", 
            dataConversao: dataAtual,
            valorPagoAcumulado: 0,
            vlTotPend: orcamento.vlTotGeral || "0.00",
            historicoPagamentos: [],
            itens: (orcamento.itens || []).map(item => ({ ...item, data: dataAtual }))
        };

        listaOS.push(novaOS);
        setBD('ordServ', listaOS);

        orcamento.status = "Convertido"; 
        orcamento.osGerada = novoCodigoOS; 
        setBD('orcamentos', listaOrcamentos);

        alert(`Orçamento convertido com sucesso para a O.S. nº ${novoCodigoOS}!`);
        window.location.reload(); 
    } catch (erro) {
        console.error("Erro ao converter:", erro);
        alert("Ocorreu um erro ao salvar os dados.");
    }
}
function selecionaCliente(idInput, chaveLocalStorage) {
    const input = $(idInput);
    if (!input) return;

    const idDatalist = `lista-${idInput}`;
    let dataList = $(idDatalist) || document.createElement('datalist');
    
    if (!dataList.id) {
        dataList.id = idDatalist;
        input.parentNode.appendChild(dataList);
        input.setAttribute('list', idDatalist);
    }

    input.addEventListener('input', () => {
        const termo = input.value.toLowerCase().trim();
        dataList.innerHTML = '';
        if (termo.length === 0) return;

        getBD(chaveLocalStorage).filter(item => item.nome?.toLowerCase().includes(termo)).forEach(item => {
            const option = document.createElement('option');
            option.value = item.nome;
            dataList.appendChild(option);
        });
    });

    input.addEventListener('change', () => {
        const cliente = getBD(chaveLocalStorage).find(item => item.nome?.toLowerCase() === input.value.trim().toLowerCase());
        if (!cliente) return;
        
        const campos = {
            'endCli': cliente.rua, 'endNr': cliente.numero, 'endCidade': cliente.cidade,
            'endUf': cliente.uf, 'cnpj': cliente.cnpj, 'fone': cliente.fone
        };
        Object.entries(campos).forEach(([id, val]) => { if ($(id)) $(id).value = val || ""; });
    });
}

function renderizarItensOrdem(itens) {
    const tbody = document.querySelector('#tabelaServicos tbody');
    if (!tbody) return;
    tbody.innerHTML = ""; 

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

function verificarEAdicionarLinha(inputData, linhaAtual) {
    const tbody = linhaAtual.closest('tbody');
    const linhas = tbody.querySelectorAll('tr');
    const ultimaLinha = linhas[linhas.length - 1];

    if (linhaAtual === ultimaLinha && inputData.value.trim() !== "") {
        const novaLinha = ultimaLinha.cloneNode(true);
        novaLinha.querySelectorAll('input').forEach(input => {
            input.value = "";
            if (input.id) input.removeAttribute('id'); 
        });
        tbody.appendChild(novaLinha);
    }
}
function nrOrc() {
    const lista = getBD('orcamentos');
    const proximoNumero = lista.length > 0 ? Math.max(...lista.map(o => parseInt(o.codigo) || 0)) + 1 : 1;
    
    if ($('nrOrc')) $('nrOrc').value = proximoNumero.toString().padStart(4, '0');        
    if ($('dataOrc')) $('dataOrc').value = new Date().toISOString().split('T')[0];
}

function mudarCadastro(direcao) {
    const tabela = getBD('orcamentos');
    if (tabela.length === 0) return;
    
    idxOrc = (idxOrc + direcao + tabela.length) % tabela.length;
    exibirDados(); 
}

function exibirDados() {
    const tabela = getBD('orcamentos');    
    const contador = $('contador');

    if (tabela.length === 0) {
        if (contador) contador.innerText = "0 / 0";
        return;
    }

    idxOrc = (idxOrc + tabela.length) % tabela.length;
    const ordem = tabela[idxOrc];

    const mapaCampos = {
        'nrOrc': ordem.codigo, 'condPgto': ordem.condPgto, 'dataOrc': ordem.data,
        'nmCliente': ordem.cliente, 'endCli': ordem.endCli, 'endNr': ordem.endNr,
        'endCidade': ordem.endCidade, 'endUf': ordem.endUF, 'cnpj': ordem.cnpj,
        'fone': ordem.foneCli, 'vlTotGeral': ordem.vlTotGeral, 'obs': ordem.obs
    };

    Object.entries(mapaCampos).forEach(([id, val]) => { if ($(id)) $(id).value = val || ""; });
    renderizarItensOrdem(ordem.itens);

    if (contador) contador.innerText = `${idxOrc + 1} de ${tabela.length}`;
}

function excluirOrc() {
    const valorOS = $val('nrOrc');
    if (!valorOS) return alert("Selecione o orçamento para excluir.");
    if (!confirm(`Tem certeza que deseja excluir o Orçamento nº ${valorOS}?`)) return;

    const ordServ = getBD('orcamentos');
    const novaLista = ordServ.filter(o => String(o.codigo).trim() !== String(valorOS).trim());

    if (ordServ.length === novaLista.length) return alert("Orçamento não encontrado no banco de dados.");

    setBD('orcamentos', novaLista);
    alert("Orçamento excluído com sucesso!");
    limparOrc();
    exibirDados();
}

function limparOrc() {
    document.querySelectorAll('input:not([disabled]), textarea').forEach(el => el.value = "");
    const tbody = document.querySelector('#tabelaServicos tbody');
    
    if (tbody) {
        tbody.innerHTML = `
            <tr class="linha-servico">
                <td><input class="descProd" type="text"></td>
                <td><input class="valor" type="number" step="0.01" value="0.00"></td>
                <td><input class="qtd" type="number" value="0"></td>
                <td><input class="total" type="text" readonly value="0.00"></td>
            </tr>`;
    }
    nrOrc();
    $('nmCliente')?.focus();
    validarTabelaEmTempoReal();
}
