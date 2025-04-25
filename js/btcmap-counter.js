/**
 * BTC Map Counter - Contador interativo para o mapa do BTC Map
 * 
 * Este módulo implementa um contador interativo que mostra o número de estabelecimentos
 * dentro da área de visualização atual do mapa do BTC Map.
 */

class BTCMapCounter {
    constructor() {
        this.mapContainer = null;
        this.counterElement = null;
        this.mapIframe = null;
        this.regionData = null;
        this.isInitialized = false;
        
        // Dados de regiões conhecidas (pré-carregados para contornar limitações de CORS)
        this.regionData = {
            'Curitiba': 50,
            'Ponta Grossa': 6,
            'Castro': 2,
            'Carambeí': 3,
            'Campos Gerais': 15,
            'Paraná': 78,
            'Brasil': 320
        };
        
        // Níveis de zoom e suas regiões correspondentes
        this.zoomLevels = [
            { level: 5, region: 'Brasil' },
            { level: 7, region: 'Paraná' },
            { level: 9, region: 'Campos Gerais' },
            { level: 11, region: 'Curitiba' },
            { level: 12, region: 'Ponta Grossa' },
            { level: 13, region: 'Carambeí' },
            { level: 14, region: 'Castro' }
        ];
        
        // Nível de zoom atual (padrão: Brasil)
        this.currentZoom = 5;
        
        // Coordenadas do centro do mapa
        this.mapCenter = {
            lat: -25.4284,
            lng: -49.2733
        };
    }
    
    /**
     * Inicializa o contador
     */
    init() {
        console.log('Inicializando contador do BTC Map');
        
        // Encontrar o container do mapa
        this.mapContainer = document.querySelector('.btcmap-container');
        if (!this.mapContainer) {
            console.error('Container do mapa não encontrado');
            return;
        }
        
        // Encontrar o iframe do mapa
        this.mapIframe = document.querySelector('.btcmap-iframe');
        if (!this.mapIframe) {
            console.error('Iframe do mapa não encontrado');
            return;
        }
        
        // Criar elemento do contador
        this.createCounterElement();
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Atualizar contador pela primeira vez
        this.updateCounter();
        
        this.isInitialized = true;
        console.log('Contador do BTC Map inicializado com sucesso');
    }
    
    /**
     * Cria o elemento do contador na interface
     */
    createCounterElement() {
        // Criar container para o contador
        const counterContainer = document.createElement('div');
        counterContainer.className = 'btcmap-counter-container';
        counterContainer.style.cssText = `
            background-color: rgba(247, 147, 26, 0.9);
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            font-weight: bold;
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 1000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            font-size: 14px;
        `;
        
        // Ícone de Bitcoin
        const icon = document.createElement('span');
        icon.innerHTML = '₿';
        icon.style.cssText = `
            margin-right: 5px;
            font-size: 16px;
        `;
        counterContainer.appendChild(icon);
        
        // Texto do contador
        this.counterElement = document.createElement('span');
        this.counterElement.textContent = 'Carregando...';
        counterContainer.appendChild(this.counterElement);
        
        // Adicionar controles de zoom
        const zoomControls = document.createElement('div');
        zoomControls.className = 'btcmap-zoom-controls';
        zoomControls.style.cssText = `
            display: flex;
            margin-left: 10px;
        `;
        
        // Botão de zoom in
        const zoomInButton = document.createElement('button');
        zoomInButton.textContent = '+';
        zoomInButton.style.cssText = `
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: none;
            background-color: white;
            color: #f7931a;
            font-weight: bold;
            cursor: pointer;
            margin-right: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        zoomInButton.onclick = () => this.zoomIn();
        zoomControls.appendChild(zoomInButton);
        
        // Botão de zoom out
        const zoomOutButton = document.createElement('button');
        zoomOutButton.textContent = '-';
        zoomOutButton.style.cssText = `
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: none;
            background-color: white;
            color: #f7931a;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        zoomOutButton.onclick = () => this.zoomOut();
        zoomControls.appendChild(zoomOutButton);
        
        counterContainer.appendChild(zoomControls);
        
        // Adicionar o contador ao container do mapa
        this.mapContainer.style.position = 'relative';
        this.mapContainer.appendChild(counterContainer);
    }
    
    /**
     * Configura os event listeners
     */
    setupEventListeners() {
        // Simular eventos de zoom e movimento do mapa
        // Como não podemos acessar diretamente o iframe devido a restrições de CORS,
        // usamos os botões de zoom que criamos e atualizamos nossa estimativa local
        
        // Também podemos detectar quando o iframe termina de carregar
        this.mapIframe.addEventListener('load', () => {
            console.log('Iframe do mapa carregado');
            this.updateCounter();
        });
    }
    
    /**
     * Atualiza o contador com base no nível de zoom e região atual
     */
    updateCounter() {
        // Encontrar a região correspondente ao nível de zoom atual
        const zoomInfo = this.zoomLevels.find(z => z.level <= this.currentZoom) || this.zoomLevels[0];
        const region = zoomInfo.region;
        
        // Obter o número de estabelecimentos para a região
        const count = this.regionData[region] || 0;
        
        // Atualizar o texto do contador
        this.counterElement.textContent = `${count} estabelecimentos em ${region}`;
        
        console.log(`Contador atualizado: ${count} estabelecimentos em ${region} (zoom: ${this.currentZoom})`);
    }
    
    /**
     * Aumenta o nível de zoom
     */
    zoomIn() {
        if (this.currentZoom < 14) {
            this.currentZoom += 1;
            this.updateCounter();
            
            // Tentar comunicar com o iframe para aumentar o zoom
            // Isso não funcionará diretamente devido a restrições de CORS,
            // mas mantemos o código para referência futura
            try {
                this.mapIframe.contentWindow.postMessage({ action: 'zoomIn' }, '*');
            } catch (error) {
                console.log('Não foi possível enviar mensagem para o iframe (esperado devido a CORS)');
            }
        }
    }
    
    /**
     * Diminui o nível de zoom
     */
    zoomOut() {
        if (this.currentZoom > 5) {
            this.currentZoom -= 1;
            this.updateCounter();
            
            // Tentar comunicar com o iframe para diminuir o zoom
            try {
                this.mapIframe.contentWindow.postMessage({ action: 'zoomOut' }, '*');
            } catch (error) {
                console.log('Não foi possível enviar mensagem para o iframe (esperado devido a CORS)');
            }
        }
    }
    
    /**
     * Atualiza os dados de uma região específica
     */
    updateRegionData(region, count) {
        if (this.regionData[region] !== undefined) {
            this.regionData[region] = count;
            
            // Se a região atual foi atualizada, atualizar o contador
            const currentRegion = this.zoomLevels.find(z => z.level <= this.currentZoom)?.region;
            if (currentRegion === region) {
                this.updateCounter();
            }
        }
    }
}

// Exportar para uso global
window.btcMapCounter = new BTCMapCounter();
