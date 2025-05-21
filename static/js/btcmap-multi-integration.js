/**
 * Integração com a API do BTC Map para múltiplas localidades
 * 
 * Este arquivo fornece funções para interagir com a API de integração,
 * permitindo cadastrar e buscar estabelecimentos que aceitam Bitcoin no OpenStreetMap
 * para múltiplas localidades (Carambeí, Ponta Grossa e Telêmaco Borba).
 */

/**
 * Configuração da API de integração
 */
const API_CONFIG = {
  baseUrl: '/api', // URL base da API de integração (relativa ao domínio atual)
  endpoints: {
    add: '/establishments',
    update: '/establishments/',
    search: '/establishments/search',
    sync: '/establishments/sync'
  }
};

/**
 * Cliente para interação com a API de integração com suporte a múltiplas localidades
 */
class BTCMapMultiIntegrationClient {
  constructor() {
    // Cache de estabelecimentos por localidade
    this.establishmentsCache = {};
    
    // Data da última atualização do cache por localidade
    this.lastUpdateTime = {};
    
    // Tempo de expiração do cache em milissegundos (30 minutos)
    this.cacheExpirationTime = 30 * 60 * 1000;
  }
  
  /**
   * Adiciona um novo estabelecimento ao OpenStreetMap via BTC Map.
   * 
   * @param {Object} establishment - Dados do estabelecimento
   * @param {string} establishment.nome - Nome do estabelecimento
   * @param {string} establishment.tipo - Tipo do estabelecimento
   * @param {string} establishment.endereco - Endereço completo
   * @param {number} establishment.latitude - Latitude
   * @param {number} establishment.longitude - Longitude
   * @param {boolean} establishment.aceitaLightning - Se aceita pagamentos Lightning
   * @param {boolean} establishment.aceitaOnchain - Se aceita pagamentos on-chain
   * @param {boolean} establishment.cadastroLocal - Se deve ser cadastrado apenas localmente
   * @param {boolean} establishment.cadastroOSM - Se deve ser sincronizado com OSM
   * @param {string} [establishment.osm_id] - ID do estabelecimento no OSM (se existente)
   * @param {string} [establishment.osm_type] - Tipo do elemento no OSM (se existente)
   * @param {string} [establishment.locationId] - ID da localidade (opcional)
   * @returns {Promise<Object>} Resultado da operação
   */
  async addEstablishment(establishment) {
    try {
      console.log('Cadastrando estabelecimento:', establishment);
      
      // Verificar se é apenas cadastro local ou se deve sincronizar com OSM
      const endpoint = establishment.cadastroLocal && !establishment.cadastroOSM 
        ? `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.add}?local_only=true` 
        : `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.add}`;
      
      // Formatar dados para a API
      const apiData = {
        name: establishment.nome,
        type: establishment.tipo,
        address: establishment.endereco,
        lat: establishment.latitude,
        lon: establishment.longitude,
        accepts_lightning: establishment.aceitaLightning,
        accepts_onchain: establishment.aceitaOnchain,
        osm_id: establishment.osm_id,
        osm_type: establishment.osm_type,
        // Adicionar tag para identificar que o estabelecimento foi cadastrado pelo "Aceita Bitcoin?"
        tags: {
          'currency:XBT': 'yes',
          'payment:lightning': establishment.aceitaLightning ? 'yes' : 'no',
          'payment:onchain': establishment.aceitaOnchain ? 'yes' : 'no',
          'check_date:currency:XBT': new Date().toISOString().split('T')[0], // Data atual no formato YYYY-MM-DD
          'source:bitcoin_acceptance': 'aqui_aceita_bitcoin' // Tag para identificar a origem do cadastro
        }
      };
      
      // Adicionar localidade às tags se fornecida
      if (establishment.locationId) {
        apiData.tags['source:location'] = establishment.locationId;
      }
      
      // Simulação de resposta para desenvolvimento (remover em produção)
      // Em um ambiente real, isso seria uma chamada à API
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Estabelecimento cadastrado com sucesso (simulação)');
          
          // Adicionar ao cache se uma localidade foi especificada
          if (establishment.locationId && this.establishmentsCache[establishment.locationId]) {
            const newEstablishment = {
              id: 'local_' + Date.now(),
              name: establishment.nome,
              type: establishment.tipo,
              address: establishment.endereco,
              coordinates: [establishment.longitude, establishment.latitude],
              tags: apiData.tags
            };
            
            this.establishmentsCache[establishment.locationId].push(newEstablishment);
            this.lastUpdateTime[establishment.locationId] = Date.now();
          }
          
          resolve({
            success: true,
            message: establishment.cadastroLocal && !establishment.cadastroOSM
              ? 'Estabelecimento cadastrado com sucesso no site "Aceita Bitcoin?"'
              : 'Estabelecimento cadastrado com sucesso e será sincronizado com o OpenStreetMap',
            establishment: {
              id: 'local_' + Date.now(),
              ...apiData
            }
          });
        }, 1500);
      });
      
      /* Código para ambiente de produção
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao cadastrar estabelecimento');
      }
      
      return await response.json();
      */
    } catch (error) {
      console.error('Erro ao cadastrar estabelecimento:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza um estabelecimento existente no OpenStreetMap via BTC Map.
   * 
   * @param {string} osmId - ID do estabelecimento no OpenStreetMap
   * @param {Object} establishment - Dados atualizados do estabelecimento
   * @param {string} [locationId] - ID da localidade (opcional)
   * @returns {Promise<Object>} Resultado da operação
   */
  async updateEstablishment(osmId, establishment, locationId) {
    try {
      console.log('Atualizando estabelecimento:', osmId, establishment);
      
      // Simulação de resposta para desenvolvimento (remover em produção)
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Estabelecimento atualizado com sucesso (simulação)');
          
          // Atualizar no cache se uma localidade foi especificada
          if (locationId && this.establishmentsCache[locationId]) {
            const index = this.establishmentsCache[locationId].findIndex(e => e.id === osmId);
            if (index !== -1) {
              this.establishmentsCache[locationId][index] = {
                ...this.establishmentsCache[locationId][index],
                name: establishment.nome || this.establishmentsCache[locationId][index].name,
                type: establishment.tipo || this.establishmentsCache[locationId][index].type,
                address: establishment.endereco || this.establishmentsCache[locationId][index].address,
                tags: {
                  ...this.establishmentsCache[locationId][index].tags,
                  'payment:lightning': establishment.aceitaLightning ? 'yes' : 'no',
                  'payment:onchain': establishment.aceitaOnchain ? 'yes' : 'no',
                  'check_date:currency:XBT': new Date().toISOString().split('T')[0]
                }
              };
              
              this.lastUpdateTime[locationId] = Date.now();
            }
          }
          
          resolve({
            success: true,
            message: 'Estabelecimento atualizado com sucesso',
            establishment: {
              id: osmId,
              ...establishment
            }
          });
        }, 1500);
      });
      
      /* Código para ambiente de produção
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.update}${osmId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(establishment)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar estabelecimento');
      }
      
      return await response.json();
      */
    } catch (error) {
      console.error('Erro ao atualizar estabelecimento:', error);
      throw error;
    }
  }
  
  /**
   * Busca estabelecimentos que aceitam Bitcoin no OpenStreetMap via BTC Map para uma localidade específica.
   * 
   * @param {string} locationId - ID da localidade
   * @param {Object} locationBounds - Limites geográficos da localidade
   * @param {boolean} [forceRefresh=false] - Se verdadeiro, força a atualização do cache
   * @returns {Promise<Array>} Lista de estabelecimentos encontrados
   */
  async searchEstablishmentsByLocation(locationId, locationBounds, forceRefresh = false) {
    try {
      console.log(`Buscando estabelecimentos para localidade: ${locationId}`);
      
      // Verificar se temos dados em cache e se não estão expirados
      const cacheIsValid = this.establishmentsCache[locationId] && 
                          this.lastUpdateTime[locationId] && 
                          (Date.now() - this.lastUpdateTime[locationId] < this.cacheExpirationTime);
      
      if (cacheIsValid && !forceRefresh) {
        console.log(`Usando dados em cache para ${locationId}`);
        return this.establishmentsCache[locationId];
      }
      
      // Construir opções de busca
      const options = {
        bounds: locationBounds,
        limit: 100
      };
      
      // Simulação de resposta para desenvolvimento (remover em produção)
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`Estabelecimentos encontrados para ${locationId} (simulação)`);
          
          // Dados simulados para cada localidade
          const mockData = {
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
          
          // Obter dados para a localidade solicitada
          const establishments = mockData[locationId] || [];
          
          // Atualizar cache
          this.establishmentsCache[locationId] = establishments;
          this.lastUpdateTime[locationId] = Date.now();
          
          resolve(establishments);
        }, 1000);
      });
      
      /* Código para ambiente de produção
      // Construir URL com parâmetros de consulta
      const url = new URL(`${window.location.origin}${API_CONFIG.baseUrl}${API_CONFIG.endpoints.search}`);
      
      // Adicionar parâmetros de consulta
      if (options.bounds) {
        url.searchParams.append('south', options.bounds.south);
        url.searchParams.append('west', options.bounds.west);
        url.searchParams.append('north', options.bounds.north);
        url.searchParams.append('east', options.bounds.east);
      }
      if (options.limit) {
        url.searchParams.append('limit', options.limit);
      }
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar estabelecimentos');
      }
      
      const data = await response.json();
      const establishments = data.establishments || [];
      
      // Atualizar cache
      this.establishmentsCache[locationId] = establishments;
      this.lastUpdateTime[locationId] = Date.now();
      
      return establishments;
      */
    } catch (error) {
      console.error(`Erro ao buscar estabelecimentos para ${locationId}:`, error);
      throw error;
    }
  }
  
  /**
   * Busca estabelecimentos para todas as localidades
   * 
   * @param {Array} locations - Lista de objetos de localidade com id e coordinates
   * @param {boolean} [forceRefresh=false] - Se verdadeiro, força a atualização do cache
   * @returns {Promise<Object>} Mapa de localidades para estabelecimentos
   */
  async searchEstablishmentsForAllLocations(locations, forceRefresh = false) {
    const results = {};
    
    for (const location of locations) {
      try {
        const establishments = await this.searchEstablishmentsByLocation(
          location.id, 
          location.coordinates, 
          forceRefresh
        );
        results[location.id] = establishments;
      } catch (error) {
        console.error(`Erro ao buscar estabelecimentos para ${location.id}:`, error);
        results[location.id] = [];
      }
    }
    
    return results;
  }
  
  /**
   * Sincroniza estabelecimentos cadastrados localmente com o OpenStreetMap.
   * Esta função é usada pelo sistema para sincronizar em lote, sem interação do usuário.
   * 
   * @param {Array} [establishmentIds] - IDs dos estabelecimentos a sincronizar (opcional, se não fornecido sincroniza todos pendentes)
   * @param {string} [locationId] - ID da localidade (opcional)
   * @returns {Promise<Object>} Resultado da operação
   */
  async syncWithOSM(establishmentIds = [], locationId = null) {
    try {
      console.log('Sincronizando estabelecimentos com OSM:', 
                 establishmentIds.length ? establishmentIds : 'todos pendentes',
                 locationId ? `para localidade ${locationId}` : '');
      
      // Simulação de resposta para desenvolvimento (remover em produção)
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Sincronização com OSM concluída com sucesso (simulação)');
          
          // Se uma localidade foi especificada, forçar atualização do cache
          if (locationId) {
            // Marcar cache como expirado para forçar atualização na próxima busca
            this.lastUpdateTime[locationId] = 0;
          }
          
          resolve({
            success: true,
            message: 'Sincronização com OpenStreetMap concluída com sucesso',
            synced: establishmentIds.length || 'todos pendentes',
            location: locationId || 'todas',
            details: {
              total: establishmentIds.length || 5,
              success: establishmentIds.length || 5,
              failed: 0
            }
          });
        }, 2000);
      });
      
      /* Código para ambiente de produção
      const endpoint = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.sync}`;
      const body = { establishmentIds };
      
      // Adicionar localidade se fornecida
      if (locationId) {
        body.locationId = locationId;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao sincronizar com OpenStreetMap');
      }
      
      const result = await response.json();
      
      // Se uma localidade foi especificada, forçar atualização do cache
      if (locationId) {
        // Marcar cache como expirado para forçar atualização na próxima busca
        this.lastUpdateTime[locationId] = 0;
      }
      
      return result;
      */
    } catch (error) {
      console.error('Erro ao sincronizar com OpenStreetMap:', error);
      throw error;
    }
  }
  
  /**
   * Limpa o cache de estabelecimentos
   * 
   * @param {string} [locationId] - ID da localidade (opcional, se não fornecido limpa todo o cache)
   */
  clearCache(locationId = null) {
    if (locationId) {
      console.log(`Limpando cache para localidade ${locationId}`);
      delete this.establishmentsCache[locationId];
      delete this.lastUpdateTime[locationId];
    } else {
      console.log('Limpando todo o cache de estabelecimentos');
      this.establishmentsCache = {};
      this.lastUpdateTime = {};
    }
  }
  
  /**
   * Verifica se um ponto está próximo de estabelecimentos existentes.
   * 
   * @param {Array} establishments - Lista de estabelecimentos existentes
   * @param {number} lat - Latitude do ponto a verificar
   * @param {number} lon - Longitude do ponto a verificar
   * @param {number} [radius=30] - Raio de proximidade em metros
   * @returns {Object|null} Estabelecimento mais próximo dentro do raio ou null se não houver
   */
  findNearbyEstablishment(establishments, lat, lon, radius = 30) {
    // Função para calcular a distância entre dois pontos (fórmula de Haversine)
    function getDistance(lat1, lon1, lat2, lon2) {
      const R = 6371e3; // Raio da Terra em metros
      const φ1 = lat1 * Math.PI / 180;
      const φ2 = lat2 * Math.PI / 180;
      const Δφ = (lat2 - lat1) * Math.PI / 180;
      const Δλ = (lon2 - lon1) * Math.PI / 180;
      
      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      
      return R * c; // Distância em metros
    }
    
    // Encontrar o estabelecimento mais próximo
    let nearestEstablishment = null;
    let minDistance = Infinity;
    
    for (const establishment of establishments) {
      // Verificar se o estabelecimento tem coordenadas
      if (!establishment.coordinates || establishment.coordinates.length !== 2) {
        continue;
      }
      
      const estLon = establishment.coordinates[0];
      const estLat = establishment.coordinates[1];
      
      const distance = getDistance(lat, lon, estLat, estLon);
      if (distance < radius && distance < minDistance) {
        minDistance = distance;
        nearestEstablishment = establishment;
      }
    }
    
    return nearestEstablishment;
  }
}

// Exportar cliente para uso global
window.btcMapMultiIntegration = new BTCMapMultiIntegrationClient();
