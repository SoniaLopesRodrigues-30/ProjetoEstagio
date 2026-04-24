

// Garante que o número e a data apareçam assim que a página carregar
window.onload = function() {
    nrOS();
};

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
    let somaPendente=0;
    let somaFaturado=0

    
    todosTotais.forEach(campo => {
        somaGeral += parseFloat(campo.value) || 0;
        somaPendente += parseFloat(campo.value) || 0;
        somaFaturado += parseFloat(campo.value) || 0;
    });

    const vlTotalGeral = document.getElementById('vlTotGeral');
    if (vlTotalGeral) {
        vlTotalGeral.value = somaGeral.toFixed(2);
    }    
    
}

//FUNÇÃO PARA SALVAR A ORDEM
function salvarOrdemServ() {
    const nmCliente = document.getElementById('nmCliente');
    
    if (!nmCliente?.value.trim()) {
        alert("Informe o Cliente!");
        return false;
    }

    try {
        const ordServ = JSON.parse(localStorage.getItem('ordServ')) || [];
        const nrServico = document.getElementById('nrServico').value;

        // Captura itens com Map para um código mais limpo
        const itens = Array.from(document.querySelectorAll('.linha-servico'))
            .map(linha => ({
                descricao: linha.querySelector('.descProd').value,
                valor: linha.querySelector('.valor').value,
                qtd: linha.querySelector('.qtd').value,
                total: linha.querySelector('.total').value,
                data: linha.querySelector('.data-servico').value
            }))
            .filter(item => item.descricao.trim() !== ""); // Remove linhas vazias

        const novaOrdem = {
            codigo: nrServico,
            data: document.getElementById('dataServ').value,
            cliente: nmCliente.value,
            endCli: document.getElementById('endCli').value,
            endNr: document.getElementById('endNr').value,
            endCidade: document.getElementById('endCidade').value,
            endUF: document.getElementById('endUf').value,
            cnpj: document.getElementById('cnpj').value,
            foneCli: document.getElementById('fone').value,
            itens: itens,
            vlTotGeral: document.getElementById('vlTotGeral').value,
            obs: document.getElementById('obs').value,
            dataRegistro: new Date().toISOString() 
        };

        // Verifica se é uma edição ou nova ordem
        const index = ordServ.findIndex(os => os.codigo === nrServico);
        if (index !== -1) {
            ordServ[index] = novaOrdem; // Atualiza a existente
        } else {
            ordServ.push(novaOrdem); // Adiciona nova
        }

        localStorage.setItem('ordServ', JSON.stringify(ordServ));
        alert("Ordem de Serviço salva com sucesso!");               
        limparOrdem();      
        return true;

    } catch (error) {
        console.error("Erro ao salvar no localStorage:", error);
        alert("Erro ao salvar os dados.");
        return false;
    }
}




//FUNÇÃO PARA BAIXAR PARCIALMENTE A ORDEM---ABA BAIXAS
function baixarOrdem(nrServico, valorPago) {
    try {
        let ordServ = JSON.parse(localStorage.getItem('ordServ')) || [];
        const index = ordServ.findIndex(os => os.codigo === nrServico);

        if (index === -1) {
            alert("Ordem de Serviço não encontrada!");
            return;
        }

        let os = ordServ[index];

        // PEGA VALORES JÁ BAIXADOS PARA ORDEM ATUAL, SE NÃO TIVER NADA FICA 0
        if (!os.valorPagoAcumulado) os.valorPagoAcumulado = 0;
        if (!os.historicoPagamentos) os.historicoPagamentos = [];

        // CONVERTE PARA VALORES
        const valorParcela = parseFloat(valorPago);
        const totalGeral = parseFloat(os.vlTotGeral);

        if (isNaN(valorParcela) || valorParcela <= 0) {
            alert("Informe um valor de pagamento válido!");
            return;
        }

        // VERIFICA SE O VALOR INFORMADO PARA BAIXA NÃO É MAIOR QUE O TOTAL DA ORDEM
        const saldoRestante = totalGeral - os.valorPagoAcumulado;
        if (valorParcela > saldoRestante) {
            alert(`Valor excede o saldo devedor! Saldo atual: R$ ${saldoRestante.toFixed(2)}`);
            return;
        }

        // ATUALIZA OS DADOS
        os.valorPagoAcumulado += valorParcela;
        os.historicoPagamentos.push({
            data: new Date().toISOString(),
            valor: valorParcela
        });

        // ATUALIZA STATUS DA ORDEM
        if (os.valorPagoAcumulado >= totalGeral) {
            os.status = "PAGO";
        } else {
            os.status = "PENDENTE";
        }

        // SALVA DE VOLTA NO  LocalStorage
        ordServ[index] = os;
        localStorage.setItem('ordServ', JSON.stringify(ordServ));

        alert(`Baixa de R$ ${valorParcela.toFixed(2)} registrada com sucesso!`);
        return true;

    } catch (error) {
        console.error("Erro ao dar baixa:", error);
    }
}




//FUNÇÃO PARA LIMPAR
function limparOrdem() {
    
    document.getElementById('formOrdServ').reset();   
    
    const tabela = document.querySelector('#tabelaItens tbody');
    if (tabela) {
        tabela.innerHTML = '';
    }
    
    nrOS();
}


//FUNÇÃO PARA EXCLUIR ORDEM
function excluirOrdemServ(nrOS) {
    // Confirmação do usuário
    if (!confirm(`Tem certeza que deseja excluir a OS nº ${codigoParaExcluir}?`)) {
        return;
    }

    // Busca os dados atuais
    let ordServ = JSON.parse(localStorage.getItem('ordServ')) || [];

    // Filtra a lista mantendo apenas o que NÃO for o código informado
    const novaLista = ordServ.filter(ordem => ordem.codigo !== codigoParaExcluir);

    // Verifica se algo foi removido de fato
    if (ordServ.length === novaLista.length) {
        alert("Ordem de serviço não encontrada.");
        return;
    }

    // Salva a nova lista e atualiza a tela
    localStorage.setItem('ordServ', JSON.stringify(novaLista));
    alert("Ordem de serviço excluída!");
    
    
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

    const campoData = document.getElementById('dataServ');     
    if (campoData) {
        campoData.value = new Date().toISOString().split('T')[0];
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


document.addEventListener('DOMContentLoaded', function() {
    //SALVAR
    const btn = document.getElementById('btnSalvar');
    if (btn) {
        btn.addEventListener('click', salvarOrdemServ);
    }

    //BAIXAR VALOR
    const baixa = document.getElementById('btnBaixar');
    if (baixa) {
        baixa.addEventListener('click', baixarOrdem);
    }
});


//  EVENTO DE SUBMIT
const formOrdServ = document.getElementById('formOrdServ');
formOrdServ.addEventListener('submit', (e) => {
    e.preventDefault();     
    
    if (salvarOrdemServ()) {
      return true
    }
});

   
// QUANDO DIGITO O NOME DO CLIENTE
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