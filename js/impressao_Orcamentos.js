
// botão imprimir
const btnimprimir = document.getElementById('btnImprimir');
if (btnimprimir) {
    btnimprimir.addEventListener('click', imprimirOrcamento);
}

function imprimirOrcamento() {    
    const nrOrcInput = document.getElementById('nrOrc');
    const nrOrc = nrOrcInput?.value.trim() || "";

    if (nrOrc === "") {
        alert("Por favor, digite o número do orçamento para poder imprimir.");
        return;
    }

    // BUSCA OS DADOS GRAVADOS NO LOCALSTORAGE
    const bancoLocal = localStorage.getItem('orcamentos');
    if (!bancoLocal) {
        alert("Nenhum orçamento cadastrado no sistema.");
        return;
    }

    const listaOrcamentos = JSON.parse(bancoLocal);

    // ENCONTRA O ORÇAMENTO ESPECÍFICO DENTRO DA LISTA
    const orcamento = listaOrcamentos.find(os => os.codigo === nrOrc);

    if (!orcamento) {
        alert(`Não encontramos o orçamento nº ${nrOrc} no sistema.`);
        return;
    }

    // Mapeia os dados 
    const dataOrc = orcamento.data || "";
    const nmcliente = orcamento.cliente || "";
    const cnpj = orcamento.cnpj || "";
    const fone = orcamento.foneCli || "";
    const obs = orcamento.obs || "Nenhuma";
    const vltotgeral = orcamento.vlTotGeral || "0.00";
    
    let linhashtml = "";
    const listaItens = orcamento.itens || [];

    // MONTA AS LINHAS DA TABELA
    listaItens.forEach(servico => {
        const desc = servico.descricao || "";
        const qtd = parseFloat(servico.qtd) || 0;
        const valor = parseFloat(servico.valor) || 0;
        const total = parseFloat(servico.total) || 0;

        linhashtml += `
            <tr>
                <td>${desc}</td>
                <td style="text-align: center;">${qtd}</td>
                <td style="text-align: right;">R$ ${valor.toFixed(2)}</td>
                <td style="text-align: right;">R$ ${total.toFixed(2)}</td>
            </tr>
        `;
    });

    // ABRE A JANELA DE IMPRESSÃO 
    const janelaimpressao = window.open('', '_blank', 'width=850,height=900');
    if (!janelaimpressao) {
        alert("O bloqueador de pop-ups impediu a abertura da impressão.");
        return;
    }

    // Captura os dados de endereço e pagamento estruturados no seu salvarOrcamento
    const enderecoCompleto = `${orcamento.endCli || ""}, ${orcamento.endNr || ""}`.trim();
    const cidadeUF = `${orcamento.endCidade || ""} - ${orcamento.endUF || ""}`.trim();
    const condPgto = orcamento.condPgto || "A combinar";  

    // 1. Cálculos de data e validade automática (15 dias úteis/corridos padrão)
    const dataEmissaoVal = orcamento.data ? new Date(orcamento.data + 'T00:00:00') : new Date();
    const dataFormatada = orcamento.data ? orcamento.data.split('-').reverse().join('/') : dataEmissaoVal.toLocaleDateString('pt-BR');
    
    // Adiciona 15 dias para a validade do orçamento
    const dataValidade = new Date(dataEmissaoVal);
    dataValidade.setDate(dataValidade.getDate() + 15);
    const validadeFormatada = dataValidade.toLocaleDateString('pt-BR');   

    janelaimpressao.document.write(`
        <!doctype html>
        <html lang="pt-BR">
        
        <head>
            <meta charset="UTF-8">
            <title>Orçamento nº ${nrOrc}</title>            
            <link rel="stylesheet" href="./css/impressao_orcamento.css">
        </head>
        <body>
            
            <!-- Topo com Espaço para Logotipo -->
            <div class="header-container">
                <div class="brand-area">                    
                    <img src="./img/logo.png" class="logo-real" alt="Logotipo">                    
                    
                    <div class="empresa-info">
                        <h1>Orçamento de Serviço</h1>
                        <p>Documento de prestação de serviços e propostas</p>
                    </div>
                </div>
                <div class="orcamento-badge">
                    <h2>Orçamento</h2>
                    <div class="numero">Nº ${nrOrc}</div>
                    <div class="datas-box">
                        <div>Emissão: <strong>${dataFormatada}</strong></div>
                        <div class="validade-tag">Válido até: <strong>${validadeFormatada}</strong></div>
                    </div>
                </div>
            </div>
            
                        <!-- Informações do Cliente e Pagamento -->
            <div class="grid-info">
                <div class="card">
                    <div class="card-title">Dados do Cliente</div>
                    <div class="info-item"><strong>Cliente:</strong> ${nmcliente}</div>
                    ${cnpj ? `<div class="info-item"><strong>CNPJ/CPF:</strong> ${cnpj}</div>` : ''}
                    ${fone ? `<div class="info-item"><strong>Telefone:</strong> ${fone}</div>` : ''}
                    ${enderecoCompleto ? `<div class="info-item"><strong>Endereço:</strong> ${enderecoCompleto}</div>` : ''}
                    ${cidadeUF ? `<div class="info-item"><strong>Cidade:</strong> ${cidadeUF}</div>` : ''}
                </div>
                
                <div class="card">
                    <div class="card-title">Condições</div>
                    <div class="info-item"><strong>Pagamento:</strong></div>
                    <div class="info-item" style="color: #2b6cb0; font-weight: 600; margin-bottom: 12px;">${condPgto}</div>
                    <div class="info-item"><strong>Prazo de Validade:</strong></div>
                    <div class="info-item" style="font-size: 12px; color: #4a5568;">15 dias a partir da emissão.</div>
                </div>
            </div>

            <!-- Tabela Modificada -->
            <table>
                <thead>
                    <tr>
                        <th style="text-align: left;">Descrição do Serviço / Produto</th>
                        <th style="width: 80px; text-align: center;">Qtd</th>
                        <th style="width: 130px; text-align: right;">Val. Unitário</th>
                        <th style="width: 130px; text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${linhashtml}
                </tbody>
            </table>

            <!-- Blocos Finais -->
            <div class="resumo-container">
                <div class="observacoes">
                    <strong>Observações / Termos:</strong>
                    ${obs}
                </div>
                
                <div class="valores-finais">
                    <div class="total-row">
                        <span class="label">Subtotal dos itens</span>
                        <span>R$ ${vltotgeral}</span>
                    </div>
                    <div class="total-row principal">
                        <span class="label">TOTAL GERAL</span>
                        <span class="valor-total">R$ ${vltotgeral}</span>
                    </div>
                </div>
            </div>

            <!-- Área Opcional para Assinaturas -->
            <div class="assinatura-box">
                <div class="linha-assinatura">Responsável da Empresa</div>
                <div class="linha-assinatura">Aceite do Cliente</div>
            </div>

            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 200);
                };
            <\/script>
        </body>
        </html>
    `);

    janelaimpressao.document.close();
    
    
}
