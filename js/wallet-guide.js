function initWalletGuides() {
    // Mostrar detalhes da carteira quando o usuário clicar em "Saiba Mais"
    const walletInfoButtons = document.querySelectorAll('.btn-wallet-info');
    
    walletInfoButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Rolar até a seção de detalhes da carteira
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Destacar a seção por um momento
                targetElement.classList.add('highlight');
                setTimeout(() => {
                    targetElement.classList.remove('highlight');
                }, 1500);
            }
        });
    });
    
    // Adicionar comparação interativa entre carteiras
    const comparisonTable = document.querySelector('.comparison-table');
    if (comparisonTable) {
        // Adicionar classe para destacar a linha quando o mouse passar por cima
        const rows = comparisonTable.querySelectorAll('tbody tr');
        rows.forEach(row => {
            row.addEventListener('mouseenter', function() {
                this.classList.add('highlight-row');
            });
            
            row.addEventListener('mouseleave', function() {
                this.classList.remove('highlight-row');
            });
        });
    }
}
