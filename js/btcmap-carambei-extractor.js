/**
 * BTC Map Carambeí Extractor - Extrai estabelecimentos cadastrados em Carambeí do BTC Maps
 * 
 * Este módulo implementa a funcionalidade para extrair informações sobre estabelecimentos
 * cadastrados em Carambeí no BTC Maps e exibi-los no site "Aqui aceita Bitcoin?".
 */

class BTCMapCarambeiExtractor {
    constructor() {
        // Coordenadas aproximadas de Carambeí
        this.carambeiCoordinates = {
            south: -25.1,
            west: -50.2,
            north: -24.8,
            east: -49.9
        };
        
        // Armazenamento para os estabelecimentos extraídos
        this.establishments = [];
        
        // Elemento onde os estabelecimentos serão exibidos
        this.containerElement = null;
        
        // Status da inicialização
        this.isInitialized = false;
        
        // Dados simulados para desenvolvimento (serão substituídos por dados reais da API)
        this.mockEstablishments = [
            {
                id: 'n7890123456',
                name: 'Café Colonial Frederica\'s',
                type: 'cafe',
                address: 'Av. dos Pioneiros, 1876 - Centro, Carambeí',
                coordinates: [-50.0982, -24.9515],
                tags: {
                    'currency:XBT': 'yes',
                    'payment:lightning': 'yes',
                    'payment:onchain': 'yes',
                    'check_date:currency:XBT': '2025-03-15'
                }
            },
            {
                id: 'n7890123457',
                name: 'Restaurante Sabor Holandês',
                type: 'restaurant',
                address: 'Rua das Tulipas, 234 - Centro, Carambeí',
                coordinates: [-50.1021, -24.9489],
                tags: {
                    'currency:XBT': 'yes',
                    'payment:lightning': 'yes',
                    'payment:onchain': 'no',
                    'check_date:currency:XBT': '2025-03-20'
                }
            },
            {
                id: 'n7890123458',
                name: 'Mercado Central',
                type: 'supermarket',
                address: 'Rua Principal, 567 - Centro, Carambeí',
                coordinates: [-50.0956, -24.9532],
                tags: {
                    'currency:XBT': 'yes',
                    'payment:lightning': 'no',
                    'payment:onchain': 'yes',
                    'check_date:currency:XBT': '2025-04-01'
                }
            }
        ];
    }
    
    /**
     * Inicializa o extrator
     * @param {string} containerId - ID do elemento onde os estabelecimentos serão exibidos
     */
    init(containerId = 'carambei-establishments') {
        console.log('Inicializando extrator de estabelecimentos de Carambeí');
        
        // Encontrar o container onde os estabelecimentos serão exibidos
        this.containerElement = document.getElementById(containerId);
        if (!this.containerElement) {
            console.warn(`Container #${containerId} não encontrado. Criando elemento.`);
            this.containerElement = document.createElement('div');
            this.containerElement.id = containerId;
            document.querySelector('main').appendChild(this.containerElement);
        }
        
        // Extrair estabelecimentos
        this.fetchEstablishments()
            .then(() => {
                // Renderizar estabelecimentos
                this.renderEstablishments();
                this.isInitialized = true;
                console.log('Extrator de estabelecimentos de Carambeí inicializado com sucesso');
            })
            .catch(error => {
                console.error('Erro ao inicializar extrator:', error);
                // Exibir mensagem de erro no container
                this.containerElement.innerHTML = `
                    <div class="error-message">
                        <p>Não foi possível carregar os estabelecimentos de Carambeí.</p>
                        <p>Erro: ${error.message}</p>
                    </div>
                `;
            });
    }
    
    /**
     * Busca estabelecimentos cadastrados em Carambeí no BTC Maps
     * @returns {Promise<Array>} Lista de estabelecimentos
     */
    async fetchEstablishments() {
        try {
            console.log('Buscando estabelecimentos de Carambeí no BTC Maps');
            
            // Em um ambiente de produção, usaríamos a API do BTC Maps
            // Aqui, usamos dados simulados para desenvolvimento
            
            // Verificar se o cliente de integração com BTC Maps está disponível
            if (window.btcMapIntegration) {
                try {
                    // Tentar usar o cliente de integração para buscar estabelecimentos
                    const options = {
                        bounds: this.carambeiCoordinates,
                        limit: 100
                    };
                    
                    console.log('Usando cliente de integração para buscar estabelecimentos');
                    const establishments = await window.btcMapIntegration.searchEstablishments(options);
                    
                    if (establishments && establishments.length > 0) {
                        console.log(`${establishments.length} estabelecimentos encontrados via API`);
                        this.establishments = establishments;
                        return establishments;
                    } else {
                        console.log('Nenhum estabelecimento encontrado via API, usando dados simulados');
                        this.establishments = this.mockEstablishments;
                        return this.mockEstablishments;
                    }
                } catch (error) {
                    console.warn('Erro ao usar cliente de integração:', error);
                    console.log('Usando dados simulados como fallback');
                    this.establishments = this.mockEstablishments;
                    return this.mockEstablishments;
                }
            } else {
                console.log('Cliente de integração não disponível, usando dados simulados');
                this.establishments = this.mockEstablishments;
                return this.mockEstablishments;
            }
        } catch (error) {
            console.error('Erro ao buscar estabelecimentos:', error);
            throw error;
        }
    }
    
    /**
     * Renderiza os estabelecimentos no container
     */
    renderEstablishments() {
        if (!this.containerElement) return;
        
        console.log('Renderizando estabelecimentos de Carambeí');
        
        // Limpar container
        this.containerElement.innerHTML = '';
        
        // Título da seção
        const title = document.createElement('h3');
        title.textContent = 'Estabelecimentos em Carambeí que aceitam Bitcoin';
        title.className = 'establishments-title';
        this.containerElement.appendChild(title);
        
        // Verificar se há estabelecimentos
        if (this.establishments.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'Nenhum estabelecimento encontrado em Carambeí.';
            emptyMessage.className = 'empty-message';
            this.containerElement.appendChild(emptyMessage);
            return;
        }
        
        // Criar lista de estabelecimentos
        const list = document.createElement('div');
        list.className = 'establishments-list';
        
        // Adicionar cada estabelecimento à lista
        this.establishments.forEach(establishment => {
            const card = this.createEstablishmentCard(establishment);
            list.appendChild(card);
        });
        
        this.containerElement.appendChild(list);
        
        // Adicionar link para ver todos os estabelecimentos
        const viewAllLink = document.createElement('a');
        viewAllLink.href = 'estabelecimentos-carambei.html';
        viewAllLink.className = 'view-all-link';
        viewAllLink.innerHTML = 'Ver todos os estabelecimentos de Carambeí <i class="fas fa-arrow-right"></i>';
        this.containerElement.appendChild(viewAllLink);
    }
    
    /**
     * Cria um card para um estabelecimento
     * @param {Object} establishment - Dados do estabelecimento
     * @returns {HTMLElement} Elemento do card
     */
    createEstablishmentCard(establishment) {
        const card = document.createElement('div');
        card.className = 'establishment-card';
        
        // Nome do estabelecimento
        const name = document.createElement('h3');
        name.textContent = establishment.name;
        card.appendChild(name);
        
        // Endereço
        const address = document.createElement('p');
        address.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${establishment.address}`;
        card.appendChild(address);
        
        // Tipo
        const type = document.createElement('p');
        type.innerHTML = `<i class="fas fa-store"></i> ${this.formatEstablishmentType(establishment.type)}`;
        card.appendChild(type);
        
        // Métodos de pagamento
        const paymentMethods = document.createElement('p');
        paymentMethods.className = 'payment-methods';
        
        // Lightning
        if (establishment.tags && establishment.tags['payment:lightning'] === 'yes') {
            const lightning = document.createElement('span');
            lightning.className = 'payment-method lightning';
            lightning.innerHTML = '<i class="fas fa-bolt"></i> Lightning';
            paymentMethods.appendChild(lightning);
        }
        
        // On-chain
        if (establishment.tags && establishment.tags['payment:onchain'] === 'yes') {
            const onchain = document.createElement('span');
            onchain.className = 'payment-method onchain';
            onchain.innerHTML = '<i class="fas fa-link"></i> On-chain';
            paymentMethods.appendChild(onchain);
        }
        
        card.appendChild(paymentMethods);
        
        // Data de verificação
        if (establishment.tags && establishment.tags['check_date:currency:XBT']) {
            const checkDate = document.createElement('p');
            checkDate.className = 'check-date';
            checkDate.innerHTML = `<i class="fas fa-calendar-check"></i> Verificado em: ${this.formatDate(establishment.tags['check_date:currency:XBT'])}`;
            card.appendChild(checkDate);
        }
        
        return card;
    }
    
    /**
     * Formata o tipo de estabelecimento
     * @param {string} type - Tipo do estabelecimento
     * @returns {string} Tipo formatado
     */
    formatEstablishmentType(type) {
        const types = {
            'cafe': 'Café',
            'restaurant': 'Restaurante',
            'supermarket': 'Supermercado',
            'shop': 'Loja',
            'hotel': 'Hotel',
            'bar': 'Bar',
            'bakery': 'Padaria'
        };
        
        return types[type] || type;
    }
    
    /**
     * Formata uma data no formato YYYY-MM-DD para DD/MM/YYYY
     * @param {string} dateStr - Data no formato YYYY-MM-DD
     * @returns {string} Data formatada
     */
    formatDate(dateStr) {
        try {
            const [year, month, day] = dateStr.split('-');
            return `${day}/${month}/${year}`;
        } catch (error) {
            return dateStr;
        }
    }
    
    /**
     * Atualiza os dados dos estabelecimentos
     */
    refresh() {
        this.fetchEstablishments()
            .then(() => {
                this.renderEstablishments();
                console.log('Dados dos estabelecimentos atualizados com sucesso');
            })
            .catch(error => {
                console.error('Erro ao atualizar dados dos estabelecimentos:', error);
            });
    }
}

// Exportar para uso global
window.btcMapCarambeiExtractor = new BTCMapCarambeiExtractor();

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se estamos na página inicial ou na página de estabelecimentos
    const isHomePage = window.location.pathname === '/' || 
                      window.location.pathname === '/index.html' ||
                      window.location.pathname.endsWith('/index.html');
    
    const isEstablishmentsPage = window.location.pathname.includes('estabelecimentos-carambei');
    
    if (isHomePage) {
        // Na página inicial, inicializar com o container padrão
        window.btcMapCarambeiExtractor.init('featured-establishments');
    } else if (isEstablishmentsPage) {
        // Na página de estabelecimentos, inicializar com o container específico
        window.btcMapCarambeiExtractor.init('carambei-establishments-full');
    }
});
