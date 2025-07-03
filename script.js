document.addEventListener('DOMContentLoaded', () => {
    const burger = document.getElementById('burger-menu');
    const navLinks = document.getElementById('nav-links');

    if (burger && navLinks) {
        burger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            burger.classList.toggle('toggle'); // Para la animación del burger
        });

        // Cierra la navegación cuando se hace clic en un enlace (para un desplazamiento suave)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                burger.classList.remove('toggle');
            });
        });
    }
});
