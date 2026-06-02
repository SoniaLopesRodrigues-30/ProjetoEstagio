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

            // Grava as credenciais no sessionStorage
            sessionStorage.setItem("usuarioCadastrado", usuarioDigitado);
            sessionStorage.setItem("senhaCadastrada", senhaDigitada);

            // Mensagem avisando que deu certo o cadastro
            alert(`Usuário "${usuarioDigitado}" cadastrado com sucesso na sessão!`);
            
            // Limpa os campos após cadastrar para o usuário testar o login
            document.getElementById("usuario").value = "";
            document.getElementById("senha").value = "";
            
            // Esconde a mensagem de erro se ela estiver aberta
            const erroEl = document.getElementById("erro");
            if (erroEl) erroEl.style.display = "none";
        });
    }

    // MELHORIA: Limpa o aviso de erro assim que o usuário começa a corrigir os dados
    const inputs = document.querySelectorAll("#usuario, #senha");
    inputs.forEach(input => {
        input.addEventListener("input", () => {
            const erroEl = document.getElementById("erro");
            if (erroEl) erroEl.style.display = "none";
        });
    });
});


function cadastrarUsuario() {
    // Salva o usuário esperado e a senha esperada na sessão
    sessionStorage.setItem("usuarioCadastrado", "iif2026");
    sessionStorage.setItem("senhaCadastrada", "123");
    
    console.log("Usuário de teste gravado no sessionStorage!");
}

// Executa a função automaticamente para garantir que os dados existam na sessão
cadastrarUsuario();

function login() {
    // Pega os valores que o usuário acabou de digitar nos campos
    const usuarioDigitado = document.getElementById("usuario").value;
    const senhaDigitada = document.getElementById("senha").value;
    
    // Busca as credenciais corretas que foram gravadas no sessionStorage
    const usuarioCorreto = sessionStorage.getItem("usuarioCadastrado");
    const senhaCorreta = sessionStorage.getItem("senhaCadastrada");
    
    // Valida se os campos combinam com o que está salvo
    if (usuarioDigitado === usuarioCorreto && senhaDigitada === senhaCorreta) {
        
        // Cria a chave que autoriza o acesso às próximas páginas
        sessionStorage.setItem("logado", "true");
        
        // Redireciona para a tela principal
        window.location.href = "./principal.html";
        
    } else {
        // Se estiver errado, exibe o erro na tela
        const erroEl = document.getElementById("erro");
        if (erroEl) erroEl.style.display = "block";        
    }
}

