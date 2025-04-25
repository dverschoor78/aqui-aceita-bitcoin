document.addEventListener('DOMContentLoaded', function() {
    // Inicializar o mapa do Bitcoin Maps
    initBitcoinMap();
    
    // Inicializar os guias de carteiras
    initWalletGuides();
    
    // Smooth scrolling para links de navegação
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Função para destacar o botão "Quero aceitar Bitcoin!"
function highlightButton() {
    const buttons = document.querySelectorAll('.btn-highlight');
    
    buttons.forEach(button => {
        // Adicionar efeito de pulsação
        button.classList.add('pulse');
        
        // Remover efeito após 2 segundos
        setTimeout(() => {
            button.classList.remove('pulse');
        }, 2000);
    });
}

// Chamar a função de destaque a cada 10 segundos
setInterval(highlightButton, 10000);

// Chamar uma vez no carregamento
setTimeout(highlightButton, 1000);
