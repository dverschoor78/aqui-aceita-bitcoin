document.addEventListener('DOMContentLoaded', async function () {
    const container = document.querySelector('.establishment-cards');
    container.innerHTML = '<p>Carregando estabelecimentos...</p>';

    try {
        const response = await fetch('/api/estabelecimentos');
        const data = await response.json();

        if (data.length === 0) {
            container.innerHTML = '<p>Nenhum estabelecimento encontrado ainda.</p>';
            return;
        }

        container.innerHTML = ''; // limpar loader

        data.forEach(est => {
            const card = document.createElement('div');
            card.className = 'establishment-card';

            const imgPath = est.logo_filename ? `static/logos/${est.logo_filename}` : 'img/logos/default.png';

            card.innerHTML = `
                <div class="establishment-image" style="background-image: url('${imgPath}')"></div>
                <div class="establishment-details">
                    <h4 class="establishment-name">${est.nome}</h4>
                    <span class="establishment-category">${formatTipo(est.tipo)}</span>
                    <div class="establishment-address">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${est.endereco}</span>
                    </div>
                    <div class="establishment-payment">
                        ${est.aceita_lightning ? `<span class="payment-method lightning"><i class="fas fa-bolt"></i> Lightning</span>` : ''}
                        ${est.aceita_onchain ? `<span class="payment-method onchain"><i class="fab fa-bitcoin"></i> On-chain</span>` : ''}
                        ${est.aceita_contactless ? `<span class="payment-method contactless"><i class="fas fa-wifi"></i> Contactless</span>` : ''}
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar estabelecimentos:', error);
        container.innerHTML = '<p>Erro ao carregar estabelecimentos.</p>';
    }
});

function formatTipo(tipo) {
    const tipos = {
        'restaurant': 'Restaurante',
        'cafe': 'Café',
        'bar': 'Bar',
        'hotel': 'Hotel',
        'shop': 'Loja',
        'supermarket': 'Supermercado',
        'bakery': 'Padaria',
        'pharmacy': 'Farmácia',
        'healthcare': 'Serviços de Saúde',
        'rental': 'Aluguel',
        'other': 'Outro'
    };
    return tipos[tipo] || tipo;
}
