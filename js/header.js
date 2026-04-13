const menuToggle = document.getElementById("id-btn-menu");
        const nav = document.getElementById("nav");
        menuToggle.addEventListener("click", () => {
            nav.classList.toggle("ativo");
        });