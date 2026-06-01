

function login() {
// -- declara -- //
    const usuario = document.getElementById("usuario").value;    // pega os valores dos campos //
    const senha = document.getElementById("senha").value;
    // -- info de login corretas -- //
    if (usuario === "magalhaes" && senha === "123") {
        // -- sessionStorage -- //
        sessionStorage.setItem("logado", "true");
        window.location.href = "./principal.html";
    } else {
        document.getElementById("erro").style.display = "block";        
    }
}







