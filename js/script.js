// Aguarda a página carregar completamente
document.addEventListener("DOMContentLoaded", () => {    
    
    // Configuração para disparar o Login ao apertar ENTER nos campos
    const camposTexto = document.querySelectorAll("#usuario, #senha");
    camposTexto.forEach(campo => {
        campo.addEventListener("keydown", (evento) => {
            if (evento.key === "Enter") {
                evento.preventDefault(); // Evita comportamentos estranhos do formulário
                login();
            }
        });
    });

    // Seleciona o seu botão de cadastro pelo ID
    const btnCadastrar = document.getElementById("btnUsuario");
    if (btnCadastrar) { // Proteção extra caso o botão não esteja na tela
        // Escuta o evento de clique no botão
        btnCadastrar.addEventListener("click", (evento) => {
            evento.preventDefault(); // Evita que a página recarregue

            // Pega os valores atuais dos campos de texto
            const usuarioDigitado = document.getElementById("usuario").value;
            const senhaDigitada = document.getElementById("senha").value;

            // Validação simples: não permite cadastrar campos vazios
            if (usuarioDigitado === "" || senhaDigitada === "") {
                alert("Por favor, preencha o usuário e a senha para cadastrar!");
                return; 
            }

            // Grava as credenciais no localStorage (Dados persistentes)
            localStorage.setItem("usuarioCadastrado", usuarioDigitado);
            localStorage.setItem("senhaCadastrada", senhaDigitada);

            // Mensagem avisando que deu certo o cadastro
            alert(`Usuário "${usuarioDigitado}" cadastrado com sucesso!`);
            
            // Limpa os campos após cadastrar para o usuário testar o login
            document.getElementById("usuario").value = "";
            document.getElementById("senha").value = "";
            
            // Esconde a mensagem de erro se ela estiver aberta
            const erroEl = document.getElementById("erro");
            if (erroEl) erroEl.style.display = "none";
        });
    }

    // Limpa o aviso de erro assim que o usuário começa a corrigir os dados
    const inputs = document.querySelectorAll("#usuario, #senha");
    inputs.forEach(input => {
        input.addEventListener("input", () => {
            const erroEl = document.getElementById("erro");
            if (erroEl) erroEl.style.display = "none";
        });
    });
});


function cadastrarUsuarioPadrao() {
    // Só cria o usuário padrão se ainda não existir nenhum cadastro no sistema
    if (!localStorage.getItem("usuarioCadastrado")) {
        localStorage.setItem("usuarioCadastrado", "iif2026");
        localStorage.setItem("senhaCadastrada", "123");
        console.log("Usuário padrão (iif2026) gravado no localStorage!");
    }
}

// Executa a função automaticamente para garantir que os dados existam
cadastrarUsuarioPadrao();

function login() {
    // Pega os valores que o usuário acabou de digitar nos campos
    const usuarioDigitado = document.getElementById("usuario").value;
    const senhaDigitada = document.getElementById("senha").value;
    
    // Busca as credenciais corretas que foram gravadas no localStorage
    const usuarioCorreto = localStorage.getItem("usuarioCadastrado");
    const senhaCorreta = localStorage.getItem("senhaCadastrada");
    
    // Valida se os campos combinam com o que está salvo
    if (usuarioDigitado === usuarioCorreto && senhaDigitada === senhaCorreta) {
        
        // Cria a chave que autoriza o acesso às próximas páginas
        // (Aqui mantemos sessionStorage para o login expirar ao fechar a aba, por segurança)
        sessionStorage.setItem("logado", "true");
        
        // Redireciona para a tela principal
        window.location.href = "./principal.html";
        
    } else {
        // Se estiver errado, exibe o erro na tela
        const erroEl = document.getElementById("erro");
        if (erroEl) erroEl.style.display = "block";        
    }
}
