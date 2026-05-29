
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

    // Captura as linhas da tabela de serviços
    let linhasHtml = "";
    document.querySelectorAll('.linha-servico').forEach(linha => {
        const desc = linha.querySelector('.descProd')?.value.trim() || "";
        const qtd = linha.querySelector('.qtd')?.value || "0";
        const valor = linha.querySelector('.valor')?.value || "0.00";
        const total = linha.querySelector('.total')?.value || "0.00";

        if (desc !== "") {
            linhasHtml += `
                <tr>
                    <td>${desc}</td>
                    <td style="text-align: center;">${qtd}</td>
                    <td style="text-align: right;">R$ ${valor}</td>
                    <td style="text-align: right;">R$ ${total}</td>
                </tr>
            `;
        }
    });

    // Abre a janela de impressão
    const janelaImpressao = window.open('', '_blank', 'width=800,height=600');
    if (!janelaImpressao) {
        alert("O bloqueador de pop-ups impediu a abertura da impressão. Ative-o para este site.");
        return;
    }

    janelaImpressao.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Ordem de Serviço Nº ${nrServico}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; color: #333; line-height: 1.4; background: #fff; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                .header h1 { margin: 0; font-size: 24px; }
                
                /* Layout seguro para impressão (Evita bugs do Flexbox) */
                .info-container { width: 100%; margin-bottom: 20px; table-layout: fixed; border-collapse: separate; border-spacing: 10px 0; }
                .info-group { width: 50%; border: 1px solid #ccc; padding: 10px; border-radius: 4px; vertical-align: top; box-sizing: border-box; }
                .info-group h3 { margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 5px; font-size: 14px; }
                
                table.servicos { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                table.servicos th { background-color: #f2f2f2; border: 1px solid #ddd; padding: 8px; text-align: left; }
                table.servicos td { border: 1px solid #ddd; padding: 8px; }
                
                .total-box { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; padding: 10px; border-top: 2px solid #000; }
                .obs-box { border: 1px solid #ccc; padding: 10px; margin-top: 15px; border-radius: 4px; background: #fafafa; page-break-inside: avoid; }
                
                /* Tabela de assinaturas segura contra quebras de página */
                .tab-assinaturas { width: 100%; margin-top: 60px; page-break-inside: avoid; }
                .campo-assinatura { border-top: 1px solid #000; text-align: center; padding-top: 5px; font-size: 12px; width: 40%; }
                .espaco-assinatura { width: 20%; }

                @media print {
                    body { margin: 10mm; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>ORDEM DE SERVIÇO</h1>
                <strong>Número: ${nrServico}</strong> | Data: ${dataServ}
            </div>

            <!-- Alterado para tabela invisível para garantir alinhamento perfeito no PDF -->
            <table class="info-container">
                <tr>
                    <td class="info-group">
                        <h3>Dados do Cliente</h3>
                        <strong>Nome:</strong> ${nmCliente}<br>
                        <strong>CNPJ/CPF:</strong> ${cnpj}<br>
                        <strong>Telefone:</strong> ${fone}
                    </td>
                    <td class="info-group">
                        <h3>VSR SISTEMAS</h3>
                        <strong>SISTEMAS DE GESTÃO LTDA</strong><br>
                        <strong>Contato:</strong> (54) 8145-4849<br>
                        <strong>E-mail:</strong> contato@empresa.com
                    </td>
                </tr>
            </table>

            <h3>Serviços / Produtos</h3>
            <table class="servicos">
                <thead>
                    <tr>
                        <th>Descrição</th>
                        <th style="text-align: center; width: 10%;">Qtd</th>
                        <th style="text-align: right; width: 20%;">Val. Unitário</th>
                        <th style="text-align: right; width: 20%;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${linhasHtml || '<tr><td colspan="4" style="text-align:center;">Nenhum serviço registrado.</td></tr>'}
                </tbody>
            </table>

            <div class="obs-box">
                <strong>Observações:</strong><br>
                <p style="margin: 5px 0 0 0; white-space: pre-wrap;">${obs}</p>
            </div>

            <div class="total-box">
                VALOR TOTAL: R$ ${vlTotGeral}
            </div>

            <table class="tab-assinaturas">
                <tr>
                    <td class="campo-assinatura">Responsável pela Empresa</td>
                    <td class="espaco-assinatura"></td>
                    <td class="campo-assinatura">Assinatura do Cliente</td>
                </tr>
            </table>
        </body>
        </html>
    `);

    janelaImpressao.document.close();
    
    // CORREÇÃO: Executa a impressão direto após fechar o fluxo de escrita do documento
    setTimeout(() => {
        janelaImpressao.print();
        janelaImpressao.close();
    }, 250); 
}
