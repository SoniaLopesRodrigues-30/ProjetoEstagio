
let indiceAtual = 0; 

const menuToggle = document.getElementById("id-btn-menu");
const nav = document.getElementById("nav");

menuToggle.addEventListener("click", () => {   
    nav.classList.toggle("ativo");
});

// Verifica se o usuário NÃO está logado
if (sessionStorage.getItem("logado") !== "true") {    
    alert("Acesso negado! Por favor, faça o login.");
    
    // Redireciona imediatamente para a sua página de login
    window.location.href = "./login.html"; 
}
