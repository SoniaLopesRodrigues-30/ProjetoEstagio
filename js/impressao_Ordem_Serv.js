

// BOTÃO IMPRIMIR
const btnImprimir = document.getElementById('btnImprimir');
if (btnImprimir) {
    btnImprimir.addEventListener('click', imprimirOrdemServ);
}

function imprimirOrdemServ() {
    // Captura os dados básicos da tela
    const nrServico = document.getElementById('nrServico')?.value || "S/N";
    const dataServ = document.getElementById('dataServ')?.value || "";
    const nmCliente = document.getElementById('nmCliente')?.value || "";
    const cnpj = document.getElementById('cnpj')?.value || "";
    const fone = document.getElementById('fone')?.value || "";
    const obs = document.getElementById('obs')?.value || "Nenhuma";
    const vlTotGeral = document.getElementById('vlTotGeral')?.value || "0.00";

    // Trata e formata a data de emissão para o padrão brasileiro
    const dataEmissaoVal = dataServ ? new Date(dataServ + 'T00:00:00') : new Date();
    const dataFormatada = dataServ ? dataServ.split('-').reverse().join('/') : dataEmissaoVal.toLocaleDateString('pt-BR');

    // Captura as linhas da tabela de serviços
    let linhasHtml = "";
    document.querySelectorAll('.linha-servico').forEach(linha => {
        // CORREÇÃO: Removido o erro de sintaxe 'line =' daqui
        const desc = linha.querySelector('.descProd')?.value.trim() || "";
        const qtd = parseFloat(linha.querySelector('.qtd')?.value) || 0;
        const valor = parseFloat(linha.querySelector('.valor')?.value) || 0;
        const total = parseFloat(linha.querySelector('.total')?.value) || 0;

        if (desc !== "") {
            linhasHtml += `
                <tr>
                    <td>${desc}</td>
                    <td style="text-align: center;">${qtd}</td>
                    <td style="text-align: right;">R$ ${valor.toFixed(2)}</td>
                    <td style="text-align: right;">R$ ${total.toFixed(2)}</td>
                </tr>
            `;
        }
    });

    if (linhasHtml === "") {
        linhasHtml = `<tr><td colspan="4" style="text-align: center; color: #777;">Nenhum serviço registrado nesta ordem de serviço.</td></tr>`;
    }

    // Abre a janela de impressão
    const janelaImpressao = window.open('', '_blank', 'width=850,height=900');
    if (!janelaImpressao) {
        alert("O bloqueador de pop-ups impediu a abertura da impressão. Ative-o para este site.");
        return;
    }

    janelaImpressao.document.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Ordem de Serviço Nº ${nrServico}</title>
            
            <!-- CHAMADA DO SEU ARQUIVO CSS SEPARADO (Mesmo layout do orçamento) -->
             <link rel="stylesheet" href="./css/impressao_orcamento.css">
        </head>
        <body>
            
            <!-- Topo Premium com Logotipo da Empresa -->
            <div class="header-container">
                <div class="brand-area">                    
                    <img src="./img/logo.png" class="logo-real" alt="Logotipo">                    
                    
                    <div class="empresa-info">
                        <!-- CORREÇÃO: Alterado os textos para refletir Ordem de Serviço -->
                        <h1>Ordem de Serviço</h1>
                        <p>Documento de execução e controle de serviços</p>
                    </div>
                </div>
                <div class="orcamento-badge">
                    <h2>Controle de O.S.</h2>
                    <div class="numero">Nº ${nrServico}</div>
                    <div class="datas-box">
                        <div>Abertura: <strong>${dataFormatada}</strong></div>
                    </div>
                </div>
            </div>
            
            <!-- Divisão moderna em blocs (Cards) para Cliente e Prestador -->
            <div class="grid-info">
                <div class="card">
                    <div class="card-title">Dados do Cliente</div>
                    <div class="info-item"><strong>Cliente:</strong> ${nmCliente}</div>
                    ${cnpj ? `<div class="info-item"><strong>CNPJ/CPF:</strong> ${cnpj}</div>` : ''}
                    ${fone ? `<div class="info-item"><strong>Telefone:</strong> ${fone}</div>` : ''}
                </div>
                
                <div class="card">
                    <div class="card-title">Prestador do Serviço</div>
                    <div class="info-item" style="color: #1a365d; font-weight: 700; text-transform: uppercase; font-size: 13px;">VSR SISTEMAS</div>
                    <div class="info-item" style="font-size: 12px; color: #4a5568; line-height: 1.4;">
                        SISTEMAS DE GESTÃO LTDA<br>
                        <strong>Contato:</strong> (54) 8145-4849<br>
                        <strong>E-mail:</strong> contato@empresa.com
                    </div>
                </div>
            </div>

            <!-- Tabela Modificada com Visual do Orçamento -->
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
                    ${linhasHtml}
                </tbody>
            </table>

            <!-- Blocos Finais de Valores e Observação -->
            <div class="resumo-container">
                <div class="observacoes">
                    <strong>Observações / Diagnóstico Técnico:</strong>
                    <div style="white-space: pre-wrap; margin-top: 5px;">${obs}</div>
                </div>
                
                <div class="valores-finais">
                    <div class="total-row">
                        <span class="label">Subtotal dos Serviços</span>
                        <span>R$ ${vlTotGeral}</span>
                    </div>
                    <div class="total-row principal">
                        <span class="label">VALOR TOTAL</span>
                        <span class="valor-total">R$ ${vlTotGeral}</span>
                    </div>
                </div>
            </div>

            <!-- Área Alinhada para Assinaturas contra quebra de folha -->
            <div class="assinatura-box">
                <div class="linha-assinatura">Responsável pela Empresa</div>
                <div class="linha-assinatura">Assinatura do Cliente (Aceite)</div>
            </div>

            <script>
                // Dispara o painel de impressão nativo assim que carregar o HTML estruturado
                window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 200);
                };
            <\/script>
        </body>
        </html>
    `);

    janelaImpressao.document.close();
} 
