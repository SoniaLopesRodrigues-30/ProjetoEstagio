
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

        //SE CASO MUDAR OS DADOS NO CADASTRO DE CLIENTES NÃO ALTERA OS DADOS NA ORDEM DE SERVIÇO
        cliente: nmCliente.value,
        endCli : document.getElementById('endCli').value,
        endNr: document.getElementById('endNr').value,
        endCidade:document.getElementById('endCidade').value,
        endUF:document.getElementById('endUf').value,
        cnpj:document.getElementById('cnpj').value,
        foneCli:document.getElementById('fone').value,

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
    const valorBanco = localStorage.getItem('ordServ');
    let proximoNumero = 1;

    if (valorBanco) {
        const listaOS = JSON.parse(valorBanco);
        
        if (listaOS.length > 0) {
            // Pega todos os códigos, converte para número e acha o maior
            const codigos = listaOS.map(os => parseInt(os.codigo) || 0);
            const maiorCodigo = Math.max(...codigos);
            proximoNumero = maiorCodigo + 1;
        }
    }

    // Formata com zeros à esquerda (ex: 0004)
    const numeroFormatado = proximoNumero.toString().padStart(4, '0');
    
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
        //  Filtra os clientes para as sugestões
        const filtrados = dados.filter(item => item.nome && item.nome.toLowerCase().includes(termo));

        filtrados.forEach(item => {
            const option = document.createElement('option');
            option.value = item.nome;
            dataList.appendChild(option);
        });

        
        // preenche os dados dos clientes selecionados
        const clienteSelecionado = filtrados.find(item => item.nome.toLowerCase() === termo);
        console.log(clienteSelecionado);
        if (clienteSelecionado) {
            
            const endCli = document.getElementById('endCli');
            const endNr= document.getElementById('endNr');
            const endCidade=document.getElementById('endCidade');
            const endUF=document.getElementById('endUf');
            const cnpj=document.getElementById('cnpj');
            const foneCli=document.getElementById('fone');

            if (endCli) endCli.value = clienteSelecionado.rua || ""; 
            if (endNr) endNr.value = clienteSelecionado.numero || "";
            if (endCidade) endCidade.value = clienteSelecionado.cidade || "";
            if (endUF) endUF.value = clienteSelecionado.uf || "";
            if (cnpj) cnpj.value = clienteSelecionado.cnpj || "";
            if (foneCli) foneCli.value = clienteSelecionado.fone || "";
           
        }
    }
});

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