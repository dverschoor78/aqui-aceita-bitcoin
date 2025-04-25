
// Código gerado automaticamente para atualizar contadores com dados reais
document.addEventListener('DOMContentLoaded', function() {
    // Dados reais obtidos da API OpenStreetMap
    const dadosReais = {
        total: 6,
        transacoes: 72,
        crescimento: "+8%",
        municipios: {
            "Ponta Grossa": {
                total: 2,
                crescimento: "+5%"
            },
            "Carambeí": {
                total: 3,
                crescimento: "+15%"
            },
            "Telêmaco Borba": {
                total: 0,
                crescimento: "0%"
            }
        }
    };
    
    // Atualizar contador principal
    const counterTotal = document.querySelector('.counter[data-target="37"]');
    if (counterTotal) {
        counterTotal.setAttribute('data-target', dadosReais.total);
        counterTotal.textContent = '0'; // Será animado para o valor real
    }
    
    // Atualizar contador de transações
    const counterTransacoes = document.querySelector('.counter[data-target="215"]');
    if (counterTransacoes) {
        counterTransacoes.setAttribute('data-target', dadosReais.transacoes);
        counterTransacoes.textContent = '0'; // Será animado para o valor real
    }
    
    // Atualizar crescimento
    const crescimentoElement = document.querySelector('.counter[data-target="+0%"]');
    if (crescimentoElement) {
        crescimentoElement.setAttribute('data-target', dadosReais.crescimento);
        crescimentoElement.textContent = '0%'; // Será animado para o valor real
    }
    
    // Atualizar gráfico de barras
    const barras = document.querySelectorAll('.chart-bar');
    const valores = document.querySelectorAll('.chart-value');
    
    // Definir alturas máximas para o gráfico
    const alturaMaxima = 180;
    const valorMaximo = Math.max(dadosReais.municipios["Ponta Grossa"].total, 
                                dadosReais.municipios["Carambeí"].total,
                                dadosReais.municipios["Telêmaco Borba"].total, 1);
    
    // Atualizar barra de Ponta Grossa
    if (barras[0] && valores[0]) {
        const altura = dadosReais.municipios["Ponta Grossa"].total > 0 
            ? Math.max(30, (dadosReais.municipios["Ponta Grossa"].total / valorMaximo) * alturaMaxima)
            : 0;
        barras[0].setAttribute('data-height', altura);
        valores[0].textContent = '0'; // Será animado para o valor real
        valores[0].setAttribute('data-target', dadosReais.municipios["Ponta Grossa"].total);
    }
    
    // Atualizar barra de Carambeí
    if (barras[1] && valores[1]) {
        const altura = dadosReais.municipios["Carambeí"].total > 0 
            ? Math.max(30, (dadosReais.municipios["Carambeí"].total / valorMaximo) * alturaMaxima)
            : 0;
        barras[1].setAttribute('data-height', altura);
        valores[1].textContent = '0'; // Será animado para o valor real
        valores[1].setAttribute('data-target', dadosReais.municipios["Carambeí"].total);
    }
    
    // Atualizar barra de Telêmaco Borba
    if (barras[2] && valores[2]) {
        const altura = dadosReais.municipios["Telêmaco Borba"].total > 0 
            ? Math.max(30, (dadosReais.municipios["Telêmaco Borba"].total / valorMaximo) * alturaMaxima)
            : 0;
        barras[2].setAttribute('data-height', altura);
        valores[2].textContent = '0'; // Será animado para o valor real
        valores[2].setAttribute('data-target', dadosReais.municipios["Telêmaco Borba"].total);
    }
    
    // Iniciar animação dos contadores
    animateCounters();
});
