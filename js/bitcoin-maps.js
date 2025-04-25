// Código de integração com o mapa do BTC Map para a página inicial
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o elemento do mapa existe na página
    const mapContainer = document.getElementById('btc-map');
    if (!mapContainer) return;
    
    // Inicializar o mapa usando Leaflet
    const map = L.map('btc-map').setView([-24.9421, -50.0995], 13); // Coordenadas de Carambeí
    
    // Adicionar camada de tiles do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Função para buscar estabelecimentos que aceitam Bitcoin
    function buscarEstabelecimentos() {
        // Obter os limites do mapa atual
        const bounds = map.getBounds();
        const south = bounds.getSouth();
        const west = bounds.getWest();
        const north = bounds.getNorth();
        const east = bounds.getEast();
        
        // Construir URL para a API Overpass do OpenStreetMap
        const overpassUrl = 'https://overpass-api.de/api/interpreter';
        const query = `
            [out:json];
            (
              node["currency:XBT"="yes"](${south},${west},${north},${east});
              way["currency:XBT"="yes"](${south},${west},${north},${east});
              relation["currency:XBT"="yes"](${south},${west},${north},${east});
            );
            out center;
        `;
        
        // Fazer a requisição para a API
        fetch(overpassUrl, {
            method: 'POST',
            body: query
        })
        .then(response => response.json())
        .then(data => {
            // Limpar marcadores existentes
            map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });
            
            // Adicionar novos marcadores
            data.elements.forEach(element => {
                let lat, lon;
                
                if (element.type === 'node') {
                    lat = element.lat;
                    lon = element.lon;
                } else {
                    // Para ways e relations, usar o centro
                    lat = element.center.lat;
                    lon = element.center.lon;
                }
                
                // Criar ícone personalizado para o marcador
                const bitcoinIcon = L.icon({
                    iconUrl: 'assets/images/markers/bitcoin-marker.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34]
                });
                
                // Criar marcador
                const marker = L.marker([lat, lon], { icon: bitcoinIcon }).addTo(map);
                
                // Preparar informações para o popup
                const name = element.tags.name || 'Estabelecimento sem nome';
                const acceptsLightning = element.tags['payment:lightning'] === 'yes' ? 'Sim' : 'Não';
                const acceptsOnchain = element.tags['payment:onchain'] === 'yes' ? 'Sim' : 'Não';
                
                // Adicionar popup ao marcador
                marker.bindPopup(`
                    <strong>${name}</strong><br>
                    Aceita Lightning: ${acceptsLightning}<br>
                    Aceita On-chain: ${acceptsOnchain}<br>
                    <a href="https://www.openstreetmap.org/${element.type}/${element.id}" target="_blank">Ver no OpenStreetMap</a>
                `);
            });
            
            // Atualizar contador de estabelecimentos
            const counter = document.getElementById('btc-map-counter');
            if (counter) {
                counter.textContent = data.elements.length;
            }
        })
        .catch(error => {
            console.error('Erro ao buscar estabelecimentos:', error);
        });
    }
    
    // Buscar estabelecimentos quando o mapa for carregado
    buscarEstabelecimentos();
    
    // Buscar estabelecimentos quando o mapa for movido
    map.on('moveend', buscarEstabelecimentos);
    
    // Adicionar botão para centralizar o mapa na localização do usuário
    L.control.locate({
        position: 'topright',
        strings: {
            title: 'Mostrar minha localização'
        }
    }).addTo(map);
});
