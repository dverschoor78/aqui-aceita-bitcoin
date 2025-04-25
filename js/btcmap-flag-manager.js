/**
 * BTC Map Flag Manager - Gerencia flags para estabelecimentos recém-cadastrados
 * 
 * Este módulo implementa a funcionalidade para exibir flags amarelas temporárias
 * para estabelecimentos recém-cadastrados que ainda não foram confirmados no BTC Maps.
 */

class BTCMapFlagManager {
    constructor() {
        // Armazenamento para os estabelecimentos pendentes
        this.pendingEstablishments = [];
        
        // Chave para armazenamento local
        this.storageKey = 'aqui_aceita_bitcoin_pending_establishments';
        
        // Intervalo de verificação (em milissegundos) - 24 horas
        this.checkInterval = 24 * 60 * 60 * 1000;
        
        // Status da inicialização
        this.isInitialized = false;
        
        // Referência ao mapa do BTC Map (será definida durante a inicialização)
        this.btcMapFrame = null;
    }
    
    /**
     * Inicializa o gerenciador de flags
     */
    init() {
        console.log('Inicializando gerenciador de flags para estabelecimentos');
        
        // Carregar estabelecimentos pendentes do armazenamento local
        this.loadPendingEstablishments();
        
        // Encontrar o iframe do BTC Map
        this.btcMapFrame = document.querySelector('.btcmap-iframe');
        
        // Configurar verificação periódica
        this.setupPeriodicCheck();
        
        // Adicionar flags para estabelecimentos pendentes
        this.addFlagsToMap();
        
        this.isInitialized = true;
        console.log('Gerenciador de flags inicializado com sucesso');
    }
    
    /**
     * Carrega estabelecimentos pendentes do armazenamento local
     */
    loadPendingEstablishments() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.pendingEstablishments = JSON.parse(stored);
                console.log(`${this.pendingEstablishments.length} estabelecimentos pendentes carregados`);
            } else {
                this.pendingEstablishments = [];
                console.log('Nenhum estabelecimento pendente encontrado');
            }
        } catch (error) {
            console.error('Erro ao carregar estabelecimentos pendentes:', error);
            this.pendingEstablishments = [];
        }
    }
    
    /**
     * Salva estabelecimentos pendentes no armazenamento local
     */
    savePendingEstablishments() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.pendingEstablishments));
            console.log(`${this.pendingEstablishments.length} estabelecimentos pendentes salvos`);
        } catch (error) {
            console.error('Erro ao salvar estabelecimentos pendentes:', error);
        }
    }
    
    /**
     * Adiciona um novo estabelecimento pendente
     * @param {Object} establishment - Dados do estabelecimento
     */
    addPendingEstablishment(establishment) {
        // Adicionar timestamp para rastrear quando foi adicionado
        const pendingEstablishment = {
            ...establishment,
            addedAt: Date.now(),
            status: 'pending'
        };
        
        this.pendingEstablishments.push(pendingEstablishment);
        this.savePendingEstablishments();
        
        // Adicionar flag ao mapa
        this.addFlagToMap(pendingEstablishment);
        
        console.log('Estabelecimento pendente adicionado:', pendingEstablishment.name);
        return pendingEstablishment;
    }
    
    /**
     * Configura verificação periódica de estabelecimentos pendentes
     */
    setupPeriodicCheck() {
        // Verificar imediatamente
        this.checkPendingEstablishments();
        
        // Configurar verificação periódica
        setInterval(() => {
            this.checkPendingEstablishments();
        }, this.checkInterval);
    }
    
    /**
     * Verifica se estabelecimentos pendentes já foram confirmados no BTC Maps
     */
    async checkPendingEstablishments() {
        if (this.pendingEstablishments.length === 0) return;
        
        console.log('Verificando estabelecimentos pendentes...');
        
        // Verificar cada estabelecimento pendente
        const updatedPendingEstablishments = [];
        
        for (const establishment of this.pendingEstablishments) {
            try {
                // Verificar se o estabelecimento já está no BTC Maps
                const isConfirmed = await this.checkEstablishmentInBTCMaps(establishment);
                
                if (isConfirmed) {
                    console.log(`Estabelecimento confirmado: ${establishment.name}`);
                    // Remover flag do mapa
                    this.removeFlagFromMap(establishment);
                } else {
                    // Manter na lista de pendentes
                    updatedPendingEstablishments.push(establishment);
                }
            } catch (error) {
                console.error(`Erro ao verificar estabelecimento ${establishment.name}:`, error);
                // Manter na lista em caso de erro
                updatedPendingEstablishments.push(establishment);
            }
        }
        
        // Atualizar lista de pendentes
        this.pendingEstablishments = updatedPendingEstablishments;
        this.savePendingEstablishments();
        
        console.log(`${this.pendingEstablishments.length} estabelecimentos ainda pendentes`);
    }
    
    /**
     * Verifica se um estabelecimento já está no BTC Maps
     * @param {Object} establishment - Dados do estabelecimento
     * @returns {Promise<boolean>} True se o estabelecimento já está no BTC Maps
     */
    async checkEstablishmentInBTCMaps(establishment) {
        try {
            // Usar o cliente de integração para buscar estabelecimentos próximos
            if (!window.btcMapIntegration) {
                console.warn('Cliente de integração não disponível');
                return false;
            }
            
            // Definir limites de busca (pequena área ao redor do estabelecimento)
            const radius = 0.001; // Aproximadamente 100 metros
            const bounds = {
                south: establishment.lat - radius,
                west: establishment.lon - radius,
                north: establishment.lat + radius,
                east: establishment.lon + radius
            };
            
            // Buscar estabelecimentos na área
            const options = { bounds, limit: 10 };
            const nearbyEstablishments = await window.btcMapIntegration.searchEstablishments(options);
            
            // Verificar se algum estabelecimento corresponde ao pendente
            for (const nearby of nearbyEstablishments) {
                // Comparar nome e coordenadas
                const isSameName = nearby.name.toLowerCase() === establishment.name.toLowerCase();
                const isSameLocation = Math.abs(nearby.lat - establishment.lat) < 0.0001 &&
                                      Math.abs(nearby.lon - establishment.lon) < 0.0001;
                
                if (isSameName && isSameLocation) {
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Erro ao verificar estabelecimento no BTC Maps:', error);
            return false;
        }
    }
    
    /**
     * Adiciona flags para todos os estabelecimentos pendentes ao mapa
     */
    addFlagsToMap() {
        if (!this.btcMapFrame) return;
        
        for (const establishment of this.pendingEstablishments) {
            this.addFlagToMap(establishment);
        }
    }
    
    /**
     * Adiciona uma flag amarela para um estabelecimento pendente no mapa
     * @param {Object} establishment - Dados do estabelecimento
     */
    addFlagToMap(establishment) {
        if (!this.btcMapFrame) return;
        
        try {
            // Criar elemento de flag
            const flagId = `pending-flag-${establishment.id || Date.now()}`;
            const flagElement = document.createElement('div');
            flagElement.id = flagId;
            flagElement.className = 'pending-establishment-flag';
            flagElement.style.cssText = `
                position: absolute;
                width: 20px;
                height: 20px;
                background-color: #FFD700;
                border-radius: 50%;
                border: 2px solid #FFA500;
                z-index: 1000;
                cursor: pointer;
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
            `;
            
            // Adicionar tooltip
            flagElement.title = `${establishment.name} (Pendente de confirmação)`;
            
            // Posicionar a flag no mapa
            this.positionFlagOnMap(flagElement, establishment);
            
            // Adicionar ao DOM
            document.querySelector('.btcmap-container').appendChild(flagElement);
            
            console.log(`Flag adicionada para ${establishment.name}`);
        } catch (error) {
            console.error('Erro ao adicionar flag ao mapa:', error);
        }
    }
    
    /**
     * Posiciona uma flag no mapa com base nas coordenadas do estabelecimento
     * @param {HTMLElement} flagElement - Elemento da flag
     * @param {Object} establishment - Dados do estabelecimento
     */
    positionFlagOnMap(flagElement, establishment) {
        // Esta é uma implementação simplificada
        // Em um ambiente real, seria necessário converter coordenadas geográficas para coordenadas de pixel
        
        // Obter dimensões do container do mapa
        const mapContainer = document.querySelector('.btcmap-container');
        if (!mapContainer) return;
        
        const mapWidth = mapContainer.offsetWidth;
        const mapHeight = mapContainer.offsetHeight;
        
        // Coordenadas do centro do mapa (aproximadas para Carambeí)
        const centerLat = -24.9152;
        const centerLon = -50.0981;
        
        // Calcular posição relativa (simplificada)
        const latDiff = establishment.lat - centerLat;
        const lonDiff = establishment.lon - centerLon;
        
        // Escala (ajustar conforme necessário)
        const scale = 10000;
        
        // Calcular posição em pixels
        const x = (mapWidth / 2) + (lonDiff * scale);
        const y = (mapHeight / 2) - (latDiff * scale);
        
        // Posicionar flag
        flagElement.style.left = `${x}px`;
        flagElement.style.top = `${y}px`;
    }
    
    /**
     * Remove uma flag do mapa
     * @param {Object} establishment - Dados do estabelecimento
     */
    removeFlagFromMap(establishment) {
        const flagId = `pending-flag-${establishment.id || establishment.addedAt}`;
        const flagElement = document.getElementById(flagId);
        
        if (flagElement) {
            flagElement.remove();
            console.log(`Flag removida para ${establishment.name}`);
        }
    }
}

// Exportar para uso global
window.btcMapFlagManager = new BTCMapFlagManager();

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se estamos na página inicial
    const isHomePage = window.location.pathname === '/' || 
                      window.location.pathname === '/index.html' ||
                      window.location.pathname.endsWith('/index.html');
    
    if (isHomePage) {
        // Inicializar gerenciador de flags
        setTimeout(() => {
            window.btcMapFlagManager.init();
        }, 1000); // Pequeno atraso para garantir que o mapa foi carregado
    }
});
