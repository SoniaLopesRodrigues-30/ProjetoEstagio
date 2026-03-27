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
const btnSalvar= document.getElementById('btnSalvar');
const form = document.getElementById('formCliente');
const tpTerceiro= document.getElementById('tpTerceiro');
const uf=document.getElementById('uf');
const razao=document.getElementById('nomeCliente');
let tipoTerceiro="";
let optUf="";


tpTerceiro.addEventListener('change', (e) => {
    tipoTerceiro = e.target.value;    
});
 
uf.addEventListener('change', (e) => {
    optUf = e.target.value;    
});

// Captura os eventos do formulário Clientes
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    
    btnSalvar.addEventListener('click', (e) => {    
             e.preventDefault();

        //TESTA PARA VER SE O NOME DO CLIENTE FOI Informado
        
        if (razao.value===""){
            alert ("Informe o Nome/Razão Social")
            return
        }     

        const dado = localStorage.getItem('clientes');

        //cria um código para cada Cliente somando a quantidade total +1       

        const listaString = localStorage.getItem('clientes');

        //  Transforma em Array e conta o .length
        let codigoTerceiro=1
        if (listaString) {
            const codigoCli = JSON.parse(listaString);                              
            codigoTerceiro = codigoCli.length + 1; 
        }

       
        // Captura os valores
        const novoCliente = {
            codigo: codigoTerceiro,
            nome: document.getElementById('nomeCliente').value,
            rua: document.getElementById('rua').value,
            email: document.getElementById('email').value,
            numero: document.getElementById('numero').value,
            cep: document.getElementById('cep').value,
            cidade: document.getElementById('cidade').value,
            bairro: document.getElementById('bairro').value,
            cpf: document.getElementById('cpf').value,
            cnpj: document.getElementById('cnpj').value,
            inscEstadual: document.getElementById('inscEstadual').value,
            fone: document.getElementById('fone').value,
            celular: document.getElementById('celular').value,
            responsavel: document.getElementById('resp').value,
            aniver: document.getElementById('aniver').value,
            site: document.getElementById('site').value,
            tpTerceUro: tipoTerceiro,
            uf: optUf,
        };

            const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
            clientes.push(novoCliente);
            localStorage.setItem('clientes', JSON.stringify(clientes));


            form.reset();
            alert('Salvo com sucesso!');

        });
})  

