// botão consultar
document.getElementById('btnConsultar')?.addEventListener('click', abrirModalConsulta);

//botão imprimir relatório geral
document.getElementById('btnImprimir')?.addEventListener('click', imprimirRelatorioGeral);

// Atalho de teclado F2 para abrir consulta (opcional, mas muito útil)
document.addEventListener('keydown', (e) => {
    if (e.key === "F2") abrirModalConsulta();
});


// Abre o modal e renderiza os dados atuais
function abrirModalConsulta() {
    const modal = document.getElementById('modalConsulta');
    modal.classList.add('active');
    renderizarTabelaConsulta(); // Atualiza a lista sempre que abrir
}

// Fecha o modal limpando o filtro
function fecharModal() {
    const modal = document.getElementById('modalConsulta');
    modal.classList.remove('active');
    document.getElementById('filtroTabela').value = ""; // Limpa a busca anterior
}

function renderizarTabelaConsulta() {
    // 1. Testa se o localStorage está trazendo dados
    const dadosRaw = localStorage.getItem("clientes");
    console.log("Conteúdo bruto do localStorage:", dadosRaw);

    const tabelaLocal = JSON.parse(dadosRaw) || [];
    console.log("Total de clientes carregados:", tabelaLocal.length);

    // 2. Testa se o JavaScript encontrou a tabela no HTML
    const tbody = document.querySelector('#tabelaConsulta tbody');
    console.log("Elemento tbody encontrado?", tbody);

    if (!tbody) {
        console.error("ERRO: O elemento '#tabelaConsulta tbody' não existe no HTML. Verifique o ID da sua tabela.");
        return; 
    }

    const filtro = document.getElementById('filtroTabela').value.toLowerCase();
    tbody.innerHTML = "";

    tabelaLocal.forEach((cliente, index) => {
        // 3. Testa a estrutura das propriedades do primeiro cliente
        if (index === 0) {
            console.log("Estrutura do primeiro cliente encontrado:", cliente);
        }

        const nomeCliente = cliente.nome ? String(cliente.nome).toLowerCase() : '';
        const codigoCliente = String(cliente.codigo || '');

        if (nomeCliente.includes(filtro) || codigoCliente.includes(filtro)) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cliente.codigo || ''}</td>
                <td>${cliente.nome || ''}</td>
                <td>${cliente.cidade || ''} - ${cliente.uf || ''}</td>
                <td>${cliente.cpf || cliente.cnpj || ''}</td>
                <td>${cliente.aniver || ''}</td>
                <td>
                    <button type="button" onclick="selecionarClienteDaTabela(${index})">Selecionar</button>
                </td>
            `;
            
            tr.onclick = (e) => {
                if (e.target.tagName !== 'BUTTON') selecionarClienteDaTabela(index);
            };
            tbody.appendChild(tr);
        }
    });
}


// Vincula o evento de digitação do filtro para atualizar a tabela em tempo real
document.getElementById('filtroTabela').addEventListener('input', renderizarTabelaConsulta);

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

