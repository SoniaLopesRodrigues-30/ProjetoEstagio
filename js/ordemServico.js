
// SOMA E ADICIONA AS LINHAS DA TABELA CONFORME FOREM SENDO PREENCHIDAS
document.addEventListener('input', function(e) {
    
    // Cálculo por linha (usando classes)
    if (e.target.classList.contains('valor') || e.target.classList.contains('qtd')) {
        const linha = e.target.closest('tr');
        const v = parseFloat(linha.querySelector('.valor').value.replace(',', '.')) || 0;
        const q = parseFloat(linha.querySelector('.qtd').value) || 0;
        
        const totalLinha = v * q;
        linha.querySelector('.total').value = totalLinha.toFixed(2);
        
        atualizarTotalGeral();
    }

    // Adicionar nova linha ao preencher a data da última linha
    if (e.target.classList.contains('data-servico')) {
        const tbody = document.querySelector('#tabelaServicos tbody');
        const linhas = tbody.getElementsByClassName('linha-servico');
        const ultimaLinha = linhas[linhas.length - 1];

        if (e.target.closest('tr') === ultimaLinha && e.target.value !== "") {
            const novaLinha = ultimaLinha.cloneNode(true);
            novaLinha.querySelectorAll('input').forEach(input => input.value = "");
            tbody.appendChild(novaLinha);
        }
    }
});

// FUNÇÃO PARA SOMAR TODAS AS LINHAS NO TOTAL GERAL
function atualizarTotalGeral() {
    const todosTotais = document.querySelectorAll('.total');
    let somaGeral = 0;
    
    todosTotais.forEach(campo => {
        somaGeral += parseFloat(campo.value) || 0;
    });

    const vlTotalGeral = document.getElementById('vlTotGeral');
    if (vlTotalGeral) {
        vlTotalGeral.value = somaGeral.toFixed(2);
    }
}

// FUNÇÃO SALVAR (ATUALIZADA PARA PEGAR MÚLTIPLOS ITENS)
function salvarOrdemServ() {
    const nmCliente = document.getElementById('nmCliente');
    if (!nmCliente || nmCliente.value.trim() === "") {
        alert("Informe o Cliente!");
        return false;
    }

    const ordServ = JSON.parse(localStorage.getItem('ordServ')) || [];

    // Captura os itens da tabela
    const itens = [];
    document.querySelectorAll('.linha-servico').forEach(linha => {
        const desc = linha.querySelector('.descProd').value;
        if (desc) { // Só salva se tiver descrição
            itens.push({
                descricao: desc,
                valor: linha.querySelector('.valor').value,
                qtd: linha.querySelector('.qtd').value,
                total: linha.querySelector('.total').value,
                data: linha.querySelector('.data-servico').value
            });
        }
    });

    const novaOrdem = {
        codigo: document.getElementById('nrServico').value, 
        data: document.getElementById('dataServ').value,
        cliente: nmCliente.value,
        itens: itens, // Agora salva a lista de serviços!
        vlTotGeral: document.getElementById('vlTotGeral').value,
        obs: document.getElementById('obs').value
    };

    ordServ.push(novaOrdem);
    localStorage.setItem('ordServ', JSON.stringify(ordServ));
    return true; 
}

//  EVENTO DE SUBMIT
const formOrdServ = document.getElementById('formOrdServ');
if (formOrdServ) {
    formOrdServ.addEventListener('submit', (e) => {
        e.preventDefault();        
        if (salvarOrdemServ()) {
            formOrdServ.reset();
            // Limpa a tabela deixando apenas uma linha
            document.querySelector('#tabelaServicos tbody').innerHTML = `
                <tr class="linha-servico">
                    <td><input class="descProd" type="text"></td>
                    <td><input class="valor" type="number" step="0.01"></td>
                    <td><input class="qtd" type="number"></td>
                    <td><input class="total" type="text" readonly></td>
                    <td><input class="data-servico" type="date"></td>
                </tr>`;
            alert('Ordem de Serviço salva com sucesso!');                       
        }
    });
}


// FUNÇÃO QUE GERA O PRÓXIMO NUMERO DA ORDEM DE SERVIÇO
function nrOS() {
  // Busca o numero da últma ordem cadastrada
  const valorBanco = localStorage.getItem('ordServ');

  // Tenta converter
  const ultimaOS = parseInt(valorBanco) || 0;
  
  // soma + 1 pra gerar o próximo
  const proximaOS = ultimaOS + 1;  
  
  let numeroFormatado = proximaOS.toString().padStart(4, '0');
  
  const campo = document.getElementById('nrServico');
  if (campo) {
      campo.value = numeroFormatado;
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
            dados.filter(item => item.nome && item.nome.toLowerCase().includes(termo))
                 .forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.nome;
                    dataList.appendChild(option);
                 });
        }
    });

    input.addEventListener('change', () => {
    const dados = JSON.parse(localStorage.getItem(chaveLocalStorage) || '[]');
    const nomeDigitado = input.value.trim();

    if (nomeDigitado === "") return;

    //  Busca os dados do cliente
    const clienteEncontrado = dados.find(item => 
        item.nome.toLowerCase() === nomeDigitado.toLowerCase()
    );

    if (clienteEncontrado) {
        // 2. Preenche os campos com os dados encontrados
        
        document.getElementById('inputEmail').value = clienteEncontrado.email || "";
        document.getElementById('inputTelefone').value = clienteEncontrado.telefone || "";
        document.getElementById('inputEndereco').value = clienteEncontrado.endereco || "";
        
        // Dica: Se quiser garantir que o nome fique idêntico ao salvo (ex: maiúsculas)
        input.value = clienteEncontrado.nome;
    } else {
        alert("Cliente não cadastrado! Selecione na lista ou cadastre o Cliente!");
        input.value = ""; 
        input.focus();
        
        // 3. Opcional: Limpa os campos se o cliente não for encontrado
        limparCampos();
    }
});

function limparCampos() {
    document.getElementById('inputEmail').value = "";
    document.getElementById('inputTelefone').value = "";
    document.getElementById('inputEndereco').value = "";
}
    
}

document.addEventListener('DOMContentLoaded', () => {
    selecionaCliente('nmCliente', 'clientes');
});



// -/-/-/- troca de aba -/-/-/- //
function trocarAba(index) {
    const abas = document.querySelectorAll(".btn-aba");
    const conteudos = document.querySelectorAll(".aba");

    abas.forEach(aba => aba.classList.remove("ativa"));
    conteudos.forEach(c => c.classList.remove("ativa"));

    abas[index].classList.add("ativa");
    conteudos[index].classList.add("ativa");
}

//chama algumas funções ao abrir a página
document.addEventListener("DOMContentLoaded", function() {
  nrOS()   
})