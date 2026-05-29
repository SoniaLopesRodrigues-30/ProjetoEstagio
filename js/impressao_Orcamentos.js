
// botão imprimir
const btnimprimir = document.getElementById('btnImprimir');
if (btnimprimir) {
    btnimprimir.addEventListener('click', imprimirOrcamento);
}

function imprimirOrcamento() {
    // captura os dados básicos da tela
    const nrOrc = document.getElementById('nrorc')?.value || "S/N";
    const dataOrc = document.getElementById('dataOrc')?.value || "";
    const nmcliente = document.getElementById('nmcliente')?.value || "";
    const cnpj = document.getElementById('cnpj')?.value || "";
    const fone = document.getElementById('fone')?.value || "";
    const obs = document.getElementById('obs')?.value || "Nenhuma";
    const vltotgeral = document.getElementById('vltotgeral')?.value || "0.00";

    // captura as linhas da tabela de serviços
    let linhashtml = "";
    document.querySelectorAll('.linha-servico').forEach(linha => {
        const desc = linha.querySelector('.descprod')?.value.trim() || "";
        const qtd = linha.querySelector('.qtd')?.value || "0";
        const valor = linha.querySelector('.valor')?.value || "0.00";
        const total = linha.querySelector('.total')?.value || "0.00";

        if (desc !== "") {
            linhashtml += `
                <tr>
                    <td>${desc}</td>
                    <td style="text-align: center;">${qtd}</td>
                    <td style="text-align: right;">R$ ${valor}</td>
                    <td style="text-align: right;">R$ ${total}</td>
                </tr>
            `;
        }
    });

    // abre a janela de impressão
    const janelaimpressao = window.open('', '_blank', 'width=800,height=600');
    if (!janelaimpressao) {
        alert("O bloqueador de pop-ups impediu a abertura da impressão. Ative-o para este site.");
        return;
    }

    // Escreve o conteúdo HTML estruturado e estilizado
    janelaimpressao.document.write(`
        <!doctype html>
        <html>
        <head>
            <title>ORÇAMENTO nº ${nrOrc}</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    color: #333; 
                    line-height: 1.4; 
                    background: #fff; 
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 20px; 
                    border-bottom: 2px solid #333; 
                    padding-bottom: 10px; 
                }
                .dados-basicos { 
                    margin-bottom: 20px; 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 10px; 
                }
                .dados-basicos div { 
                    margin-bottom: 5px; 
                }
                .full-width { 
                    grid-column: span 2; 
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 20px; 
                }
                th, td { 
                    border: 1px solid #ddd; 
                    padding: 8px; 
                    text-align: left; 
                }
                th { 
                    background-color: #f2f2f2; 
                }
                .total-geral { 
                    text-align: right; 
                    font-size: 1.2em; 
                    font-weight: bold; 
                    margin-top: 20px; 
                }
                /* Força a remoção de cabeçalhos do navegador e otimiza layout de impressão */
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>ORÇAMENTO Nº ${nrOrc}</h2>
                <p>Data: ${dataOrc}</p>
            </div>
            
            <div class="dados-basicos">
                <div><strong>Cliente:</strong> ${nmcliente}</div>
                <div><strong>CNPJ/CPF:</strong> ${cnpj}</div>
                <div><strong>Telefone:</strong> ${fone}</div>
                <div class="full-width"><strong>Observações:</strong> ${obs}</div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Descrição do Serviço / Produto</th>
                        <th style="width: 80px; text-align: center;">Qtd</th>
                        <th style="width: 120px; text-align: right;">Val. Unitário</th>
                        <th style="width: 120px; text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${linhashtml}
                </tbody>
            </table>

            <div class="total-geral">
                Valor Total Geral: R$ ${vltotgeral}
            </div>

            <script>
                // Executa a impressão assim que o documento carregar e fecha a janela depois
                window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 100);
                };
            <\/script>
        </body>
        </html>
    `);
    
    janelaimpressao.document.close();
}
