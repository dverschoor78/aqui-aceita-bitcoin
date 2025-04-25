/**
 * BTC Map Locations Manager - Gerencia múltiplas localidades para o projeto "Aceita Bitcoin?"
 * 
 * Este módulo implementa a funcionalidade para gerenciar diferentes localidades (municípios, bairros, distritos)
 * e extrair informações sobre estabelecimentos cadastrados no BTC Maps para cada localidade.
 */

class BTCMapLocationsManager {
    constructor() {
        // Lista de localidades suportadas
        this.locations = [
            {
                id: 'carambei',
                name: 'Carambeí',
                type: 'city',
                state: 'PR',
                coordinates: {
                    south: -25.1,
                    west: -50.2,
                    north: -24.8,
                    east: -49.9
                },
                center: [-50.0982, -24.9515],
                zoom: 14,
                description: 'Município com forte influência holandesa, localizado na região dos Campos Gerais do Paraná.',
                establishments: [],
                enabled: true
            },
            {
                id: 'ponta-grossa',
                name: 'Ponta Grossa',
                type: 'city',
                state: 'PR',
                coordinates: {
                    south: -25.2,
                    west: -50.25,
                    north: -24.95,
                    east: -49.9
                },
                center: [-50.1625, -25.095],
                zoom: 13,
                description: 'Maior cidade da região dos Campos Gerais do Paraná, importante polo industrial e universitário.',
                establishments: [],
                enabled: true
            },
            {
                id: 'telemaco-borba',
                name: 'Telêmaco Borba',
                type: 'city',
                state: 'PR',
                coordinates: {
                    south: -24.45,
                    west: -50.75,
                    north: -24.25,
                    east: -50.55
                },
                center: [-50.65, -24.35],
                zoom: 14,
                description: 'Município conhecido por sua indústria de papel e celulose, localizado na região dos Campos Gerais do Paraná.',
                establishments: [],
                enabled: true
            }
        ];
        
        // Localidade atual selecionada
        this.currentLocation = null;
        
        // Elemento onde os estabelecimentos serão exibidos
        this.containerElement = null;
        
        // Status da inicialização
        this.isInitialized = false;
        
        // Dados simulados para desenvolvimento (serão substituídos por dados reais da API)
        this.mockEstablishments = {
            'carambei': [
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
            ],
            'ponta-grossa': [
                {
                    id: 'n7890123459',
                    name: 'Pizzaria Bitcoin',
                    type: 'restaurant',
                    address: 'Rua Balduíno Taques, 1234 - Centro, Ponta Grossa',
                    coordinates: [-50.1625, -25.095],
                    tags: {
                        'currency:XBT': 'yes',
                        'payment:lightning': 'yes',
                        'payment:onchain': 'yes',
                        'check_date:currency:XBT': '2025-04-10'
                    }
                },
                {
                    id: 'n7890123460',
                    name: 'Livraria Satoshi',
                    type: 'shop',
                    address: 'Av. Vicente Machado, 567 - Centro, Ponta Grossa',
                    coordinates: [-50.1590, -25.0930],
                    tags: {
                        'currency:XBT': 'yes',
                        'payment:lightning': 'yes',
                        'payment:onchain': 'yes',
                        'check_date:currency:XBT': '2025-04-05'
                    }
                }
            ],
            'telemaco-borba': [
                {
                    id: 'n7890123461',
                    name: 'Café Blockchain',
                    type: 'cafe',
                    address: 'Av. Horácio Klabin, 789 - Centro, Telêmaco Borba',
                    coordinates: [-50.65, -24.35],
                    tags: {
                        'currency:XBT': 'yes',
                        'payment:lightning': 'yes',
                        'payment:onchain': 'no',
                        'check_date:currency:XBT': '2025-04-15'
                    }
                }
            ]
        };
    }
    
    /**
     * Inicializa o gerenciador de localidades
     * @param {string} containerId - ID do elemento onde os estabelecimentos serão exibidos
     * @param {string} locationId - ID da localidade a ser carregada inicialmente
     */
    init(containerId = 'featured-establishments', locationId = null) {
        console.log('Inicializando gerenciador de localidades');
        
        // Encontrar o container onde os estabelecimentos serão exibidos
        this.containerElement = document.getElementById(containerId);
        if (!this.containerElement) {
            console.warn(`Container #${containerId} não encontrado. Criando elemento.`);
            this.containerElement = document.createElement('div');
            this.containerElement.id = containerId;
            document.querySelector('main').appendChild(this.containerElement);
        }
        
        // Determinar a localidade inicial
        if (locationId) {
            // Usar a localidade especificada
            this.setCurrentLocation(locationId);
        } else {
            // Tentar determinar a localidade com base na URL
            const urlParams = new URLSearchParams(window.location.search);
            const locationFromUrl = urlParams.get('location');
            
            if (locationFromUrl && this.locationExists(locationFromUrl)) {
                this.setCurrentLocation(locationFromUrl);
            } else {
                // Usar Carambeí como padrão
                this.setCurrentLocation('carambei');
            }
        }
        
        // Extrair estabelecimentos para a localidade atual
        this.fetchEstablishmentsForCurrentLocation()
            .then(() => {
                // Renderizar estabelecimentos
                this.renderEstablishments();
                this.isInitialized = true;
                console.log('Gerenciador de localidades inicializado com sucesso');
            })
            .catch(error => {
                console.error('Erro ao inicializar gerenciador de localidades:', error);
                // Exibir mensagem de erro no container
                this.containerElement.innerHTML = `
                    <div class="error-message">
                        <p>Não foi possível carregar os estabelecimentos.</p>
                        <p>Erro: ${error.message}</p>
                    </div>
                `;
            });
    }
    
    /**
     * Verifica se uma localidade existe
     * @param {string} locationId - ID da localidade
     * @returns {boolean} Verdadeiro se a localidade existir
     */
    locationExists(locationId) {
        return this.locations.some(location => location.id === locationId);
    }
    
    /**
     * Define a localidade atual
     * @param {string} locationId - ID da localidade
     * @returns {boolean} Verdadeiro se a localidade foi definida com sucesso
     */
    setCurrentLocation(locationId) {
        const location = this.locations.find(loc => loc.id === locationId);
        if (location) {
            this.currentLocation = location;
            console.log(`Localidade atual definida para: ${location.name}`);
            return true;
        } else {
            console.warn(`Localidade não encontrada: ${locationId}`);
            return false;
        }
    }
    
    /**
     * Obtém a localidade atual
     * @returns {Object} Localidade atual
     */
    getCurrentLocation() {
        return this.currentLocation;
    }
    
    /**
     * Obtém todas as localidades
     * @param {boolean} enabledOnly - Se verdadeiro, retorna apenas localidades habilitadas
     * @returns {Array} Lista de localidades
     */
    getAllLocations(enabledOnly = false) {
        if (enabledOnly) {
            return this.locations.filter(location => location.enabled);
        }
        return this.locations;
    }
    
    /**
     * Adiciona uma nova localidade
     * @param {Object} location - Dados da localidade
     * @returns {boolean} Verdadeiro se a localidade foi adicionada com sucesso
     */
    addLocation(location) {
        // Verificar se a localidade já existe
        if (this.locationExists(location.id)) {
            console.warn(`Localidade já existe: ${location.id}`);
            return false;
        }
        
        // Adicionar a localidade
        this.locations.push(location);
        console.log(`Nova localidade adicionada: ${location.name}`);
        
        // Salvar localidades no localStorage
        this.saveLocationsToStorage();
        
        return true;
    }
    
    /**
     * Atualiza uma localidade existente
     * @param {string} locationId - ID da localidade
     * @param {Object} updatedData - Dados atualizados
     * @returns {boolean} Verdadeiro se a localidade foi atualizada com sucesso
     */
    updateLocation(locationId, updatedData) {
        const index = this.locations.findIndex(loc => loc.id === locationId);
        if (index !== -1) {
            // Manter o ID original
            updatedData.id = locationId;
            
            // Atualizar a localidade
            this.locations[index] = { ...this.locations[index], ...updatedData };
            console.log(`Localidade atualizada: ${this.locations[index].name}`);
            
            // Salvar localidades no localStorage
            this.saveLocationsToStorage();
            
            return true;
        } else {
            console.warn(`Localidade não encontrada: ${locationId}`);
            return false;
        }
    }
    
    /**
     * Remove uma localidade
     * @param {string} locationId - ID da localidade
     * @returns {boolean} Verdadeiro se a localidade foi removida com sucesso
     */
    removeLocation(locationId) {
        const index = this.locations.findIndex(loc => loc.id === locationId);
        if (index !== -1) {
            // Remover a localidade
            const removedLocation = this.locations.splice(index, 1)[0];
            console.log(`Localidade removida: ${removedLocation.name}`);
            
            // Salvar localidades no localStorage
            this.saveLocationsToStorage();
            
            return true;
        } else {
            console.warn(`Localidade não encontrada: ${locationId}`);
            return false;
        }
    }
    
    /**
     * Salva as localidades no localStorage
     */
    saveLocationsToStorage() {
        try {
            localStorage.setItem('btcmap_locations', JSON.stringify(this.locations));
            console.log('Localidades salvas no localStorage');
        } catch (error) {
            console.error('Erro ao salvar localidades no localStorage:', error);
        }
    }
    
    /**
     * Carrega as localidades do localStorage
     */
    loadLocationsFromStorage() {
        try {
            const storedLocations = localStorage.getItem('btcmap_locations');
            if (storedLocations) {
                this.locations = JSON.parse(storedLocations);
                console.log('Localidades carregadas do localStorage');
            }
        } catch (error) {
            console.error('Erro ao carregar localidades do localStorage:', error);
        }
    }
    
    /**
     * Busca estabelecimentos para a localidade atual
     * @returns {Promise<Array>} Lista de estabelecimentos
     */
    async fetchEstablishmentsForCurrentLocation() {
        if (!this.currentLocation) {
            throw new Error('Nenhuma localidade selecionada');
        }
        
        try {
            console.log(`Buscando estabelecimentos para ${this.currentLocation.name}`);
            
            // Em um ambiente de produção, usaríamos a API do BTC Maps
            // Aqui, usamos dados simulados para desenvolvimento
            
            // Verificar se o cliente de integração com BTC Maps está disponível
            if (window.btcMapIntegration) {
                try {
                    // Tentar usar o cliente de integração para buscar estabelecimentos
                    const options = {
                        bounds: this.currentLocation.coordinates,
                        limit: 100
                    };
                    
                    console.log('Usando cliente de integração para buscar estabelecimentos');
                    const establishments = await window.btcMapIntegration.searchEstablishments(options);
                    
                    if (establishments && establishments.length > 0) {
                        console.log(`${establishments.length} estabelecimentos encontrados via API para ${this.currentLocation.name}`);
                        this.currentLocation.establishments = establishments;
                        return establishments;
                    } else {
                        console.log(`Nenhum estabelecimento encontrado via API para ${this.currentLocation.name}, usando dados simulados`);
                        this.currentLocation.establishments = this.mockEstablishments[this.currentLocation.id] || [];
                        return this.currentLocation.establishments;
                    }
                } catch (error) {
                    console.warn('Erro ao usar cliente de integração:', error);
                    console.log('Usando dados simulados como fallback');
                    this.currentLocation.establishments = this.mockEstablishments[this.currentLocation.id] || [];
                    return this.currentLocation.establishments;
                }
            } else {
                console.log('Cliente de integração não disponível, usando dados simulados');
                this.currentLocation.establishments = this.mockEstablishments[this.currentLocation.id] || [];
                return this.currentLocation.establishments;
            }
        } catch (error) {
            console.error(`Erro ao buscar estabelecimentos para ${this.currentLocation.name}:`, error);
            throw error;
        }
    }
    
    /**
     * Busca estabelecimentos para todas as localidades
     * @param {boolean} enabledOnly - Se verdadeiro, busca apenas para localidades habilitadas
     * @returns {Promise<Object>} Mapa de localidades para estabelecimentos
     */
    async fetchEstablishmentsForAllLocations(enabledOnly = true) {
        const locationsToFetch = enabledOnly 
            ? this.locations.filter(location => location.enabled)
            : this.locations;
        
        const results = {};
        
        for (const location of locationsToFetch) {
            try {
                // Salvar a localidade atual
                const previousLocation = this.currentLocation;
                
                // Definir a localidade atual para a localidade a ser buscada
                this.currentLocation = location;
                
                // Buscar estabelecimentos
                const establishments = await this.fetchEstablishmentsForCurrentLocation();
                results[location.id] = establishments;
                
                // Restaurar a localidade anterior
                this.currentLocation = previousLocation;
            } catch (error) {
                console.error(`Erro ao buscar estabelecimentos para ${location.name}:`, error);
                results[location.id] = [];
            }
        }
        
        return results;
    }
    
    /**
     * Renderiza os estabelecimentos da localidade atual no container
     */
    renderEstablishments() {
        if (!this.containerElement || !this.currentLocation) return;
        
        console.log(`Renderizando estabelecimentos de ${this.currentLocation.name}`);
        
        // Limpar container
        this.containerElement.innerHTML = '';
        
        // Título da seção
        const title = document.createElement('h3');
        title.textContent = `Estabelecimentos em ${this.currentLocation.name} que aceitam Bitcoin`;
        title.className = 'establishments-title';
        this.containerElement.appendChild(title);
        
        // Verificar se há estabelecimentos
        if (!this.currentLocation.establishments || this.currentLocation.establishments.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = `Nenhum estabelecimento encontrado em ${this.currentLocation.name}.`;
            emptyMessage.className = 'empty-message';
            this.containerElement.appendChild(emptyMessage);
            return;
        }
        
        // Criar lista de estabelecimentos
        const list = document.createElement('div');
        list.className = 'establishments-list';
        
        // Adicionar cada estabelecimento à lista
        this.currentLocation.establishments.forEach(establishment => {
            const card = this.createEstablishmentCard(establishment);
            list.appendChild(card);
        });
        
        this.containerElement.appendChild(list);
        
        // Adicionar link para ver todos os estabelecimentos
        const viewAllLink = document.createElement('a');
        viewAllLink.href = `estabelecimentos.html?location=${this.currentLocation.id}`;
        viewAllLink.className = 'view-all-link';
        viewAllLink.innerHTML = `Ver todos os estabelecimentos de ${this.currentLocation.name} <i class="fas fa-arrow-right"></i>`;
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
     * Atualiza os dados dos estabelecimentos para a localidade atual
     */
    refresh() {
        this.fetchEstablishmentsForCurrentLocation()
            .then(() => {
                this.renderEstablishments();
                console.log(`Dados dos estabelecimentos de ${this.currentLocation.name} atualizados com sucesso`);
            })
            .catch(error => {
                console.error(`Erro ao atualizar dados dos estabelecimentos de ${this.currentLocation.name}:`, error);
            });
    }
    
    /**
     * Cria seletores de localidade para a página
     * @param {string} containerId - ID do elemento onde os seletores serão exibidos
     */
    createLocationSelectors(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container #${containerId} não encontrado para seletores de localidade`);
            return;
        }
        
        // Limpar container
        container.innerHTML = '';
        
        // Título
        const title = document.createElement('h3');
        title.textContent = 'Selecione uma localidade';
        title.className = 'locations-title';
        container.appendChild(title);
        
        // Criar lista de localidades
        const locationsList = document.createElement('div');
        locationsList.className = 'locations-list';
        
        // Adicionar cada localidade habilitada à lista
        this.locations.filter(location => location.enabled).forEach(location => {
            const locationCard = document.createElement('div');
            locationCard.className = 'location-card';
            if (this.currentLocation && location.id === this.currentLocation.id) {
                locationCard.classList.add('active');
            }
            
            // Nome da localidade
            const name = document.createElement('h4');
            name.textContent = location.name;
            locationCard.appendChild(name);
            
            // Descrição
            if (location.description) {
                const description = document.createElement('p');
                description.textContent = location.description;
                locationCard.appendChild(description);
            }
            
            // Número de estabelecimentos
            const count = document.createElement('p');
            count.className = 'establishment-count';
            const establishmentCount = location.establishments ? location.establishments.length : 0;
            count.innerHTML = `<i class="fas fa-store"></i> ${establishmentCount} estabelecimento${establishmentCount !== 1 ? 's' : ''}`;
            locationCard.appendChild(count);
            
            // Adicionar evento de clique
            locationCard.addEventListener('click', () => {
                this.setCurrentLocation(location.id);
                this.refresh();
                
                // Atualizar classes ativas
                document.querySelectorAll('.location-card').forEach(card => {
                    card.classList.remove('active');
                });
                locationCard.classList.add('active');
                
                // Atualizar URL
                const url = new URL(window.location.href);
                url.searchParams.set('location', location.id);
                window.history.replaceState({}, '', url.toString());
            });
            
            locationsList.appendChild(locationCard);
        });
        
        container.appendChild(locationsList);
    }
}

// Exportar para uso global
window.btcMapLocationsManager = new BTCMapLocationsManager();

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Carregar localidades do localStorage
    window.btcMapLocationsManager.loadLocationsFromStorage();
    
    // Verificar se estamos na página inicial ou na página de estabelecimentos
    const isHomePage = window.location.pathname === '/' || 
                      window.location.pathname === '/index.html' ||
                      window.location.pathname.endsWith('/index.html');
    
    const isEstablishmentsPage = window.location.pathname.includes('estabelecimentos');
    
    if (isHomePage) {
        // Na página inicial, inicializar com o container padrão
        window.btcMapLocationsManager.init('featured-establishments');
        
        // Criar seletores de localidade
        window.btcMapLocationsManager.createLocationSelectors('location-selectors');
    } else if (isEstablishmentsPage) {
        // Na página de estabelecimentos, inicializar com o container específico
        window.btcMapLocationsManager.init('establishments-full');
        
        // Criar seletores de localidade
        window.btcMapLocationsManager.createLocationSelectors('location-selectors');
    }
});
