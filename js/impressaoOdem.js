function imprimirOrdem() {
    const nrServico = document.getElementById('nrServico').value;
    const cliente = document.getElementById('nmCliente').value;
    
    if (!nrServico || !cliente) {
        alert("Carregue ou salve uma Ordem de Serviço antes de imprimir.");
        return;
    }

    // Cria uma nova janela para a impressão
    const janelaImpressao = window.open('', '', 'width=800,height=900');

    // Estilo básico CSS para o documento de impressão
    const style = `
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .info-box { display: flex; justify-content: space-between; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total-geral { text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 20px; }
            .footer { margin-top: 50px; text-align: center; font-size: 0.9em; }
            @media print { .no-print { display: none; } }
        </style>
    `;

    // Monta o conteúdo das linhas da tabela
    let itensHtml = '';
    document.querySelectorAll('.linha-servico').forEach(linha => {
        const desc = linha.querySelector('.descProd').value;
        const qtd = linha.querySelector('.qtd').value;
        const valor = linha.querySelector('.valor').value;
        const total = linha.querySelector('.total').value;
        if(desc.trim() !== "") {
            itensHtml += `<tr><td>${desc}</td><td>${qtd}</td><td>R$ ${valor}</td><td>R$ ${total}</td></tr>`;
        }
    });

    // Estrutura do documento
    janelaImpressao.document.write(`
        <html>
            <head><title>OS nº ${nrServico}</title>${style}</head>
            <body>
                <div class="header">
                    <h1>ORDEM DE SERVIÇO</h1>
                    <p>Nº: <strong>${nrServico}</strong> | Data: ${document.getElementById('dataServ').value}</p>
                </div>
                
                <div class="info-box">
                    <div>
                        <strong>Cliente:</strong> ${cliente}<br>
                        <strong>Endereço:</strong> ${document.getElementById('endCli').value}, ${document.getElementById('endNr').value}<br>
                        <strong>Cidade/UF:</strong> ${document.getElementById('endCidade').value} - ${document.getElementById('endUf').value}
                    </div>
                    <div>
                        <strong>CNPJ/CPF:</strong> ${document.getElementById('cnpj').value}<br>
                        <strong>Fone:</strong> ${document.getElementById('fone').value}
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Descrição do Serviço/Produto</th>
                            <th>Qtd</th>
                            <th>Unitário</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itensHtml}
                    </tbody>
                </table>

                <div class="total-geral">
                    Valor Total: R$ ${document.getElementById('vlTotGeral').value}
                </div>

                <div style="margin-top: 30px;">
                    <strong>Observações:</strong><br>
                    <p>${document.getElementById('obs').value || 'Sem observações.'}</p>
                </div>

                <div class="footer">
                    <br><br>
                    //colocar o logo da empresa emitente
                </div>
            </body>
        </html>
    `);

    janelaImpressao.document.close();
    janelaImpressao.print(); // Abre a caixa de diálogo de impressão
}
