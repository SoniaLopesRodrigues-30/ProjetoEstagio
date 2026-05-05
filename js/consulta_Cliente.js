// botão consultar
document.getElementById('btnConsultar')?.addEventListener('click', abrirModalConsulta);

//botão imprimir relatório geral
document.getElementById('btnImprimir')?.addEventListener('click', imprimirRelatorioGeral);

// Atalho de teclado F2 para abrir consulta (opcional, mas muito útil)
document.addEventListener('keydown', (e) => {
    if (e.key === "F2") abrirModalConsulta();
});

function abrirModalConsulta() {
    const modal = document.getElementById('modalConsulta');
    modal.style.display = 'block';
    renderizarTabelaConsulta();
    document.getElementById('filtroTabela').focus();
}

function fecharModal() {
    document.getElementById('modalConsulta').style.display = 'none';
}


//organiza os dados na tabela
function renderizarTabelaConsulta() {
    const tabelaLocal = JSON.parse(localStorage.getItem("clientes")) || [];
    const tbody = document.querySelector('#tabelaConsulta tbody');
    const filtro = document.getElementById('filtroTabela').value.toLowerCase();
    
    tbody.innerHTML = "";

    tabelaLocal.forEach((cliente, index) => {
        // Aplica o filtro por nome ou código
        if (cliente.nome.toLowerCase().includes(filtro) || String(cliente.codigo).includes(filtro)) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding:8px; text-align:center;">${cliente.codigo}</td>
                <td style="padding:8px;">${cliente.nome}</td>
                <td style="padding:8px;">${cliente.cidade || ''} - ${cliente.uf || ''}</td>
                <td style="padding:8px;">${cliente.cpf || cliente.cnpj || ''}</td>
                 <td style="padding:8px;">${cliente.cpf || cliente.aniver || ''}</td>
                <td style="padding:8px; text-align:center;">
                    <button onclick="selecionarClienteDaTabela(${index})">Selecionar</button>
                </td>
            `;
            // Permite selecionar clicando na linha inteira também
            tr.style.cursor = 'pointer';
            tr.onclick = (e) => {
                if(e.target.tagName !== 'BUTTON') selecionarClienteDaTabela(index);
            };
            tbody.appendChild(tr);
        }
    });
}

// Filtro "ao digitar" na tabela
document.getElementById('filtroTabela')?.addEventListener('input', renderizarTabelaConsulta);

function selecionarClienteDaTabela(indexOriginal) {
    // indexOriginal é a posição no array do localStorage
    idCliente = indexOriginal; 
    exibirDados();
    fecharModal();
}


function imprimirRelatorioGeral() {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    
    if (clientes.length === 0) {
        alert("Não há dados para imprimir.");
        return;
    }

    // Cria uma nova janela para o relatório
    const janelaPrint = window.open('', '', 'width=800,height=600');
    
    let html = `
        <html>
        <head>
            <title>Relatório de Clientes</title>
            <style>
                body { font-family: sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 12px; }
                th { background: #eee; }
                h2 { text-align: center; }
            </style>
        </head>
        <body>
            <h2>Relatório Geral de Clientes</h2>
            <table>
                <thead>
                    <tr>
                        <th>Cód.</th>
                        <th>Nome</th>
                        <th>CPF/CNPJ</th>
                        <th>Cidade/UF</th>
                        <th>Telefone</th>
                    </tr>
                </thead>
                <tbody>`;

    clientes.forEach(c => {
        html += `
            <tr>
                <td>${c.codigo}</td>
                <td>${c.nome}</td>
                <td>${c.cpf || c.cnpj || '-'}</td>
                <td>${c.cidade || ''}/${c.uf || ''}</td>
                <td>${c.celular || c.fone || '-'}</td>
            </tr>`;
    });

    html += `</tbody></table></body></html>`;

    janelaPrint.document.write(html);
    janelaPrint.document.close();
    
    // Pequeno delay para garantir que o navegador carregue o estilo antes de abrir o print
    setTimeout(() => {
        janelaPrint.print();
        janelaPrint.close();
    }, 500);
}

