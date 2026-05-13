
let indiceAtual = 0; 

const menuToggle = document.getElementById("id-btn-menu");
const nav = document.getElementById("nav");

menuToggle.addEventListener("click", () => {   
    nav.classList.toggle("ativo");
});

document.addEventListener('DOMContentLoaded', () => {
    const containerSino = document.getElementById('notificacao-container');
    const dropdown = document.getElementById('dropdown-notificacoes');
    const contador = document.getElementById('notificacao-contador');

    // Inicializa o contador zerado e escondido na entrada da página
    if (contador) {
        contador.textContent = '0';
        contador.style.display = 'none';
    }

    // EXECUTAR NA ENTRADA DA PÁGINA: Busca e checa os aniversários imediatamente
    const dadosLocais = localStorage.getItem('clientes');

    if (dadosLocais) {
        try {
            const listaClientes = JSON.parse(dadosLocais);

            if (Array.isArray(listaClientes)) {
                listaClientes.forEach(cliente => {
                    if (cliente.nome && cliente.aniver) {
                        controlaAniver(cliente.nome, cliente.aniver);
                    }
                });
            } else {
                if (listaClientes.nome && listaClientes.aniver) {
                    controlaAniver(listaClientes.nome, listaClientes.aniver);
                }
            }
        } catch (erro) {
            console.error("Erro ao analisar dados de clientes na entrada da página:", erro);
        }
    }

    // Configura o clique do sininho para abrir/fechar
    containerSino.addEventListener('click', (event) => {
        event.stopPropagation(); 
        dropdown.classList.toggle('ativo');
        
        // Esconde o número do contador ao abrir para indicar que foi lido
        if (contador) {
            contador.style.display = 'none';
        }
    });
   
    // Configura o clique fora para fechar a caixinha
    document.addEventListener('click', () => {
        dropdown.classList.remove('ativo');
    });
});

/**
 * Verifica se o aniversário do cliente está próximo e registra no sininho.
 */
function controlaAniver(nmCliente, dtAniver, diasDeAntecedencia = 5) {
    if (!dtAniver) return;

    // Criar data de 'hoje' zerando as horas para o cálculo exato de dias
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const anoAtual = hoje.getFullYear();
    
    
    const partes = dtAniver.split('-'); 
    const mesAniversario = parseInt(partes[1]) - 1; 
    const diaAniversario = parseInt(partes[2]);
    
    let dataNiverEsteAno = new Date(anoAtual, mesAniversario, diaAniversario);
    dataNiverEsteAno.setHours(0, 0, 0, 0);

    // CORREÇÃO 2: Se o aniversário deste ano já passou, joga para o próximo ano
    if (dataNiverEsteAno < hoje) {
        dataNiverEsteAno.setFullYear(anoAtual + 1);
    }
    
    //calcula a diferença de dias
    const diferencaTempo = dataNiverEsteAno.getTime() - hoje.getTime();
    const diferencaDias = Math.round(diferencaTempo / (1000 * 60 * 60 * 24));
    
    // Verifica se está dentro do limite de dias escolhido
    if (diferencaDias >= 0 && diferencaDias <= diasDeAntecedencia) {
        let mensagem = "";
        
        if (diferencaDias === 0) {
            mensagem = `🎂 Hoje é o aniversário de ${nmCliente}!`;
        } else {
            // Formata a exibição do dia/mês no padrão brasileiro
            const diaFormatado = String(diaAniversario).padStart(2, '0');
            const mesFormatado = String(mesAniversario + 1).padStart(2, '0');
            mensagem = `🎉 O aniversário de ${nmCliente} é daqui a ${diferencaDias} dias (${diaFormatado}/${mesFormatado})`;
        }
        
        if (typeof registrarAlteracao === 'function') {
            registrarAlteracao(mensagem);
        } else {
            console.log(mensagem);
        }
    }
}

/**
 * Adiciona uma nova notificação ao sininho e atualiza o contador.
 */
function registrarAlteracao(mensagem) {
    const lista = document.querySelector('.dropdown-lista');
    const contador = document.getElementById('notificacao-contador');

    if (!lista) return;

    const novoItem = document.createElement('div');
    novoItem.className = 'item-notificacao nova';
    
    // CORREÇÃO 4: Corrigido de 'mensaje' para 'mensagem'
    novoItem.textContent = mensagem || "Nova alteração registrada"; 

    lista.insertBefore(novoItem, lista.firstChild);

    if (contador) {
        let quantidadeAtual = parseInt(contador.textContent) || 0;
        quantidadeAtual++;
        
        contador.textContent = quantidadeAtual;
        
        // Só exibe o círculo vermelho se a caixinha suspensa estiver fechada
        const dropdown = document.getElementById('dropdown-notificacoes');
        if (dropdown && !dropdown.classList.contains('ativo')) {
            contador.style.display = 'block';
        }
    }
}