// FUNÇÃO SALVAR ORDENS DE SERVIÇO
function salvarOrdemServ() {
    
    const nmCliente = document.getElementById('nmCliente');
    
    if (!nmCliente || nmCliente.value.trim() === "") {
        alert("Informe o Cliente!");
        return false;
    }

    // Busca dados existentes 
    const ordServ = JSON.parse(localStorage.getItem('ordServ')) || [];

    const novaOrdem = {
        codigo: document.getElementById('nrServico').value, 
        data: document.getElementById('dataServ').value,
        condPgto: document.getElementById('condPgto').value,
        cliente: nmCliente.value,
        vlTotal: document.getElementById('vlTotal').value,
        dtPag: document.getElementById('dtPag').value,
        vlPago: document.getElementById('vlPago').value,
        vlTotPend: document.getElementById('vlTotPend').value,
        vlTotFat: document.getElementById('vlTotFat').value,
        vlTotGeral: document.getElementById('vlTotGeral').value,
        obs: document.getElementById('obs').value
    };

    ordServ.push(novaOrdem);
    localStorage.setItem('ordServ', JSON.stringify(ordServ));
    
    return true; 
}

if (formOrdServ) {
    formOrdServ.addEventListener('submit', (e) => {
        e.preventDefault();        

        const resultado = salvarOrdemServ();        

        if (resultado) {
            formOrdServ.reset();
            alert('Ordem de Serviço salva com sucesso!');                       
        }
    });
}

// Delegação de evento: Funciona mesmo se a tabela for carregada depois
document.addEventListener('input', function(e) {
    // Verifica se quem disparou o evento foi o campo 'valor' ou 'qtd'
    if (e.target.id === 'valor' || e.target.id === 'qtd') {
        
        const inputValor = document.getElementById('valor');
        const inputQtd = document.getElementById('qtd');
        const campoTotal = document.getElementById('total');

        if (inputValor && inputQtd && campoTotal) {
            // Converte valores (trata vírgula e vazio)
            const v = parseFloat(inputValor.value.replace(',', '.')) || 0;
            const q = parseFloat(inputQtd.value.replace(',', '.')) || 0;
            
            const resultado = v * q;
            
            // Atribui ao campo total com 2 casas decimais
            campoTotal.value = resultado.toFixed(2);
            
            // Opcional: Atualiza também o campo de Valor Total Geral da OS se ele existir
            const vlTotalGeral = document.getElementById('vlTotGeral');
            if (vlTotalGeral) {
                vlTotalGeral.value = resultado.toFixed(2);
            }
        }
    }
});