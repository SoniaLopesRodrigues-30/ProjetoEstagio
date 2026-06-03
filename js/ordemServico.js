//================================//
//=====EVENTOS INICIALIZAÇÃO=======//
let idxOrdServ = 0;

// Atalho utilitário para capturar elementos e valores de forma limpa
const $ = (id) => document.getElementById(id);
const $val = (id, defaultVal = "") => $(id)?.value || defaultVal;

// Banco de dados local centralizado
const getBD = (chave) => JSON.parse(localStorage.getItem(chave) || '[]');
const setBD = (chave, dados) => localStorage.setItem(chave, JSON.stringify(dados));

document.addEventListener('DOMContentLoaded', () => {
    inicializarTabelaServicos();
    nrOS();
    selecionaCliente('nmCliente', 'clientes');

    const gatilhos = {
        'btnSalvar': (e) => { e.preventDefault(); if (!controlaservico()) salvarOrdemServ(); },
        'btnBaixar': baixarOrdem,
        'btnAnterior': () => mudarCadastro(-1),
        'btnProximo': () => mudarCadastro(1),
        'btnNovo': limparOrdem,
        'btnCancelar': excluirOrdemServ
    };

    Object.entries(gatilhos).forEach(([id, acao]) => {
        $(id)?.addEventListener('click', acao);
    });

    validarTabelaEmTempoReal();
});
function inicializarTabelaServicos() {
    document.querySelector('#tabelaServicos')?.addEventListener('input', (e) => {
        const tgt = e.target;
        const linha = tgt.closest('tr');
        if (!linha || tgt.tagName !== 'INPUT') return;

        if (tgt.classList.contains('valor') || tgt.classList.contains('qtd')) {
            const v = parseFloat(linha.querySelector('.valor').value.replace(',', '.')) || 0;
            const q = parseFloat(linha.querySelector('.qtd').value) || 0;
            const campoTotal = linha.querySelector('.total');
            if (campoTotal) campoTotal.value = (v * q).toFixed(2);
            atualizarTotalGeral();
        }

        if (tgt.classList.contains('data-servico')) {
            verificarEAdicionarLinha(tgt, linha);
        }
        validarTabelaEmTempoReal();
    });
}

function atualizarTotalGeral() {
    let somaGeral = 0;    
    document.querySelectorAll('#tabelaServicos tbody .total').forEach(campo => {
        const texto = (campo.value !== undefined ? campo.value : campo.textContent) || "";
        somaGeral += parseFloat(texto.trim().replace(',', '.')) || 0;       
    });
    if ($('vlTotGeral')) $('vlTotGeral').value = somaGeral.toFixed(2);
}
function controlaservico() {
    const linhas = document.querySelectorAll('#tabelaServicos tbody tr');
    if (linhas.length === 0) return alert("Informe pelo menos um serviço!") || true;

    for (const [index, linha] of linhas.entries()) {
        const inputs = linha.querySelectorAll('input:not([type="hidden"]):not([disabled])');
        if (inputs.length === 0) continue; 

        if (index === 0 || inputs[0].value.trim() !== "") {
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
        vazia = Array.from(linhas[0].querySelectorAll('input:not(.total)')).every(i => !i.value.trim());
    }
    
    btn.disabled = vazia;
    btn.style.opacity = vazia ? "0.5" : "1";
    btn.style.cursor = vazia ? "not-allowed" : "pointer";
}

function converterParaNumeroSeguro(valorRaw) {
    if (!valorRaw) return 0;
    let txt = String(valorRaw).trim();
    if (txt.includes('.') && txt.includes(',')) txt = txt.replace(/\./g, '');
    return parseFloat(txt.replace(',', '.')) || 0;
}
function salvarOrdemServ() {
    if (!$val('nmCliente').trim()) return alert("Informe o Cliente!") || false;

    try {
        const ordServ = getBD('ordServ');
        const nrOSAtual = $val('nrServico');

        const itens = Array.from(document.querySelectorAll('#tabelaServicos tbody tr')).map(l => {
            const totRaw = l.querySelector('.total')?.value || "0";
            return {
                descricao: l.querySelector('.descProd')?.value?.trim() || "",
                valor: l.querySelector('.valor')?.value || "0",
                qtd: l.querySelector('.qtd')?.value || "0",
                total: totRaw,
                totalNumerico: converterParaNumeroSeguro(totRaw),
                data: l.querySelector('.data-servico')?.value || ""
            };
        }).filter(item => item.descricao !== "" && item.totalNumerico > 0);

        const somaGeral = itens.reduce((acc, item) => acc + item.totalNumerico, 0);
        const somaGeralFormatada = somaGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        if ($('vlTotGeral')) $('vlTotGeral').value = somaGeralFormatada;

        const index = ordServ.findIndex(os => String(os.codigo).trim() === String(nrOSAtual).trim());
        const osAntiga = index !== -1 ? ordServ[index] : null;

        const itensSalvar = itens.map(({ totalNumerico, ...resto }) => resto);
        const pagoAcumulado = osAntiga ? converterParaNumeroSeguro(osAntiga.valorPagoAcumulado) : 0;
        const pendente = Math.max(0, parseFloat((somaGeral - pagoAcumulado).toFixed(2)));

        const novaOrdem = {
            dataRegistro: osAntiga?.dataRegistro ?? new Date().toISOString(), 
            codigo: nrOSAtual,
            data: $val('dataServ'),
            condPgto: $val('condPgto'),
            cliente: $val('nmCliente'),
            itens: itensSalvar,
            obs: $('obs') ? $val('obs') : (osAntiga?.obs ?? ""),
            vlTotGeral: somaGeralFormatada,            
            valorPagoAcumulado: pagoAcumulado,
            vlTotPend: pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            status: (pagoAcumulado >= parseFloat(somaGeral.toFixed(2)) && somaGeral > 0) ? "FATURADO" : "PENDENTE",
            historicoPagamentos: osAntiga?.historicoPagamentos ?? []
        };

        // Preenche campos de endereço preservando os antigos se estiverem ocultos na tela
        const camposEnd = ['endCli', 'endNr', 'endCidade', 'endUF', 'cnpj', 'foneCli'];
        camposEnd.forEach(c => novaOrdem[c] = $(c) ? $val(c) : (osAntiga?.[c] ?? ""));

        const campoStatus = $('statusOrdem');
        if (campoStatus) {
            campoStatus[campoStatus.tagName === 'INPUT' ? 'value' : 'textContent'] = novaOrdem.status;
            campoStatus.style.color = novaOrdem.status === "FATURADO" ? "#2e7d32" : "#c01515";                            
        }
        if ($('vlTotPend')) $('vlTotPend').value = novaOrdem.vlTotPend;

        if (index !== -1) ordServ[index] = novaOrdem; else ordServ.push(novaOrdem);
        setBD('ordServ', ordServ);
        alert("Ordem de Serviço salva com sucesso!");               
        limparOrdem();      
        return true;
    } catch (e) {
        return console.error("Erro ao salvar:", e) || alert("Erro ao salvar os dados.") || false;
    }
}
function baixarOrdem() {
    try {
        const nrBuscado = $val('nrServico').trim();
        if (!nrBuscado) return alert("Por favor, informe o número da Ordem de Serviço!") || false;

        let ordServ = getBD('ordServ');
        const idx = ordServ.findIndex(os => String(os.codigo).trim() === nrBuscado);
        if (idx === -1) return alert(`Ordem de Serviço Nº ${nrBuscado} não encontrada!`) || false;

        let os = ordServ[idx];
        os.valorPagoAcumulado = os.valorPagoAcumulado ?? 0;
        os.historicoPagamentos = os.historicoPagamentos ?? [];

        const parcela = converterParaNumeroSeguro($val('vlPago'));
        const total = converterParaNumeroSeguro(os.vlTotGeral);
        if (parcela <= 0) return alert("Informe um valor de pagamento válido!") || false;

        const saldo = parseFloat((total - os.valorPagoAcumulado).toFixed(2));
        if (parcela > saldo) return alert(`Valor excede o saldo! Saldo atual: R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`) || false;
      
        os.valorPagoAcumulado = parseFloat((os.valorPagoAcumulado + parcela).toFixed(2));
        os.historicoPagamentos.push({ data: new Date().toISOString(), valor: parcela });

        const novoSaldo = Math.max(0, parseFloat((total - os.valorPagoAcumulado).toFixed(2)));
        os.vlTotPend = novoSaldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        os.status = os.valorPagoAcumulado >= parseFloat(total.toFixed(2)) ? "FATURADO" : "PENDENTE";

        ordServ[idx] = os;
        setBD('ordServ', ordServ);

        if ($('vlTotFat')) $('vlTotFat').value = os.valorPagoAcumulado.toFixed(2);
        if ($('vlTotPend')) $('vlTotPend').value = os.vlTotPend;

        const cStatus = $('statusOrdem');
        if (cStatus) {
            cStatus[cStatus.tagName === 'INPUT' ? 'value' : 'textContent'] = os.status;
            cStatus.style.color = os.status === "FATURADO" ? "#2e7d32" : "#c01515";                            
        }

        atualizarTabelaHistorico(os);
        if ($('vlPago')) $('vlPago').value = ""; 
        alert(`Baixa de R$ ${parcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} efetuada!`);
        return true;
    } catch (e) {
        return console.error("Erro na baixa:", e) || alert("Erro ao processar baixa.") || false;
    }
}

function trocarAba(idx) {
    const abas = document.querySelectorAll(".btn-aba");
    const conts = document.querySelectorAll(".aba");
    if (!abas[idx] || !conts[idx]) return;
    abas.forEach(a => a.classList.remove("ativa"));
    conts.forEach(c => c.classList.remove("ativa"));
    abas[idx].classList.add("ativa");
    conts[idx].classList.add("ativa");
}
function nrOS() {
    const lista = getBD('ordServ');
    const proximo = lista.length > 0 ? Math.max(...lista.map(os => parseInt(os.codigo) || 0)) + 1 : 1;
    if ($('nrServico')) $('nrServico').value = proximo.toString().padStart(4, '0');        
    if ($('dataServ')) $('dataServ').value = new Date().toISOString().split('T')[0];
}

function selecionaCliente(idInput, chaveBD) {
    const inp = $(idInput);
    if (!inp) return;
    const idList = `lista-${idInput}`;
    let dl = $(idList) || document.createElement('datalist');
    if (!dl.id) { dl.id = idList; inp.parentNode.appendChild(dl); inp.setAttribute('list', idList); }

    inp.addEventListener('input', () => {
        const termo = inp.value.toLowerCase().trim();
        dl.innerHTML = '';
        if (!termo) return;
        getBD(chaveBD).filter(i => i.nome?.toLowerCase().includes(termo)).forEach(item => {
            const opt = document.createElement('option'); opt.value = item.nome; dl.appendChild(opt);
        });
    });

    inp.addEventListener('change', () => {
        const cli = getBD(chaveBD).find(i => i.nome?.toLowerCase() === inp.value.trim().toLowerCase());
        if (!cli) return;
        const mapa = { 'endCli': cli.rua, 'endNr': cli.numero, 'endCidade': cli.cidade, 'endUf': cli.uf, 'cnpj': cli.cnpj, 'fone': cli.fone };
        Object.entries(mapa).forEach(([id, val]) => { if ($(id)) $(id).value = val || ""; });
    });
}

function atualizarTabelaHistorico(os) {
    const tbody = document.querySelector('#tabelaHistoricoBaixas tbody');
    if (!tbody) return;
    tbody.innerHTML = ''; 
    if (!os?.historicoPagamentos?.length) {
        tbody.innerHTML = `<tr><td colspan="2" style="padding:8px;text-align:center;color:#888;">Nenhum pagamento registrado.</td></tr>`;
        return;
    }
    os.historicoPagamentos.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td style="padding:8px;border-bottom:1px solid #ddd;">${new Date(p.data).toLocaleString('pt-BR')}</td>
                        <td style="padding:8px;border-bottom:1px solid #ddd;font-weight:bold;color:green;">${parseFloat(p.valor).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</td>`;
        tbody.appendChild(tr);
    });
}

function renderizarItensOrdem(itens) {
    const tbody = document.querySelector('#tabelaServicos tbody');
    if (!tbody) return;
    tbody.innerHTML = ""; 
    if (itens) {
        itens.forEach(i => {
            const tr = document.createElement('tr'); tr.className = 'linha-servico';
            tr.innerHTML = `<td><input type="text" class="descProd" value="${i.descricao}"></td><td><input type="number" class="qtd" value="${i.qtd}"></td>
                            <td><input type="text" class="valor" value="${i.valor}"></td><td><input type="text" class="total" value="${i.total}" readonly></td>
                            <td><input type="date" class="data-servico" value="${i.data}"></td>`;
            tbody.appendChild(tr);
        });
    }       
}

function verificarEAdicionarLinha(inputData, linhaAtual) {
    const tbody = linhaAtual.closest('tbody');
    const linhas = tbody.querySelectorAll('tr');
    if (linhaAtual === linhas[linhas.length - 1] && inputData.value.trim() !== "") {
        const nova = linhaAtual.cloneNode(true);
        nova.querySelectorAll('input').forEach(i => { i.value = ""; if (i.id) i.removeAttribute('id'); });
        tbody.appendChild(nova);
    }
}

function excluirOrdemServ() {
    const osNum = $val('nrServico');
    if (!osNum) return alert("Selecione uma ordem de serviço para excluir.");
    if (!confirm(`Tem certeza que deseja excluir a OS nº ${osNum}?`)) return;

    const lista = getBD('ordServ');
    const nova = lista.filter(o => String(o.codigo) !== String(osNum));
    if (lista.length === nova.length) return alert("Ordem de serviço não encontrada no banco.");

    setBD('ordServ', nova);
    alert("Ordem de serviço excluída!");
    limparOrdem(); exibirDados();
}

function mudarCadastro(direcao) {
    const lista = getBD('ordServ'); if (lista.length === 0) return;
    idxOrdServ = (idxOrdServ + direcao + lista.length) % lista.length;
    exibirDados(); 
}

function exibirDados() {
    const lista = getBD('ordServ');
    if (lista.length === 0) { if ($('contador')) $('contador').innerText = "0 / 0"; return atualizarTabelaHistorico({historicoPagamentos:[]}); }
    
    idxOrdServ = (idxOrdServ + lista.length) % lista.length;
    const os = lista[idxOrdServ];
    
    const cStatus = $('statusOrdem');
    if (cStatus) { cStatus[cStatus.tagName === 'INPUT' ? 'value' : 'textContent'] = os.status || ""; cStatus.style.color = os.status === "FATURADO" ? "#2e7d32" : "#c01515"; }

    const mapa = { 'nrServico': os.codigo, 'condPgto': os.condPgto, 'dataServ': os.data, 'nmCliente': os.cliente, 'endCli': os.endCli, 'endNr': os.endNr, 'endCidade': os.endCidade, 'endUf': os.endUF, 'cnpj': os.cnpj, 'fone': os.foneCli, 'vlTotGeral': os.vlTotGeral, 'vlTotPend': os.vlTotPend, 'obs': os.obs, 'vlTotFat': (os.valorPagoAcumulado || 0).toFixed(2) };
    Object.entries(mapa).forEach(([id, v]) => { if ($(id)) $(id).value = v || ""; });

    renderizarItensOrdem(os.itens);
    if ($('contador')) $('contador').innerText = `${idxOrdServ + 1} de ${lista.length}`;
    atualizarTabelaHistorico(os);
}

function limparOrdem() {
    document.querySelectorAll('input:not([disabled]), textarea').forEach(el => el.value = "");
    const tbody = document.querySelector('#tabelaServicos tbody');
    if (tbody) {
        tbody.innerHTML = `<tr class="linha-servico"><td><input class="descProd" type="text"></td><td><input class="valor" type="number" step="0.01" value="0.00"></td>
                            <td><input class="qtd" type="number" value="0"></td><td><input class="total" type="text" readonly value="0.00"></td><td><input class="data-servico" type="date"></td></tr>`;
    }
    nrOS();
    $('nmCliente')?.focus();
    atualizarTabelaHistorico({ historicoPagamentos: [] });
    validarTabelaEmTempoReal();
}
