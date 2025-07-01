document.addEventListener('DOMContentLoaded', () => {
        // Smooth scrolling para la navegación
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                        anchor.addEventListener('click', function (e) {
                                        e.preventDefault();
                                                    const targetId = this.getAttribute('href');
                                                                const targetElement = document.querySelector(targetId);
                                                                            if (targetElement) {
                                                                                                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                                                                                                                const offsetPosition = targetElement.offsetTop - navbarHeight;

                                                                                                                                window.scrollTo({
                                                                                                                                                        top: offsetPosition,
                                                                                                                                                                            behavior: "smooth"
                                                                                                                                });

                                                                                                                                                // Cierra el menú hamburguesa si está abierto
                                                                                                                                                                const navLinks = document.getElementById('nav-links');
                                                                                                                                                                                const burger = document.getElementById('burger-menu');
                                                                                                                                                                                                if (navLinks.classList.contains('active')) {
                                                                                                                                                                                                                        navLinks.classList.remove('active');
                                                                                                                                                                                                                                            burger.classList.remove('toggle');
                                                                                                                                                                                                }
                                                                            }
                        });
            });

                // Menú Hamburguesa
                    const burger = document.getElementById('burger-menu');
                        const navLinks = document.querySelector('.nav-links');

                            if (burger && navLinks) {
                                        burger.addEventListener('click', () => {
                                                        navLinks.classList.toggle('active');
                                                                    burger.classList.toggle('toggle');
                                        });
                            }
});
                                        })
                            }
                                                                                                                                                                                                }
                                                                                                                                })
                                                                            }
                        })
            })
})