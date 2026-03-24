function login() {
// -- declara -- //
    const usuario = document.getElementById("usuario").value;    // pega os valores dos campos //
    const senha = document.getElementById("senha").value;
    // -- info de login corretas -- //
    if (usuario === "cinema" && senha === "123") {
        // -- sessionStorage -- //
        sessionStorage.setItem("logado", "true");
        window.location.href = "filmes.html";
    } else {
        document.getElementById("erro").style.display = "block";        
    }
}