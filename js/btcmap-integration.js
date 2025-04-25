/**
 * Integração com a API do BTC Map para cadastro de estabelecimentos no OpenStreetMap.
 * 
 * Este arquivo fornece funções para interagir com a API de integração,
 * permitindo cadastrar estabelecimentos que aceitam Bitcoin no OpenStreetMap.
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
 * Cliente para interação com a API de integração
 */
class BTCMapIntegrationClient {
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
      
      // Simulação de resposta para desenvolvimento (remover em produção)
      // Em um ambiente real, isso seria uma chamada à API
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Estabelecimento cadastrado com sucesso (simulação)');
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
   * @returns {Promise<Object>} Resultado da operação
   */
  async updateEstablishment(osmId, establishment) {
    try {
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
    } catch (error) {
      console.error('Erro ao atualizar estabelecimento:', error);
      throw error;
    }
  }
  
  /**
   * Busca estabelecimentos que aceitam Bitcoin no OpenStreetMap via BTC Map.
   * 
   * @param {Object} [options] - Opções de busca
   * @param {Object} [options.bounds] - Limites geográficos da busca
   * @param {number} options.bounds.south - Latitude sul
   * @param {number} options.bounds.west - Longitude oeste
   * @param {number} options.bounds.north - Latitude norte
   * @param {number} options.bounds.east - Longitude leste
   * @param {string} [options.query] - Termo de busca
   * @param {number} [options.limit=100] - Número máximo de resultados
   * @returns {Promise<Array>} Lista de estabelecimentos encontrados
   */
  async searchEstablishments(options = {}) {
    try {
      // Construir URL com parâmetros de consulta
      const url = new URL(`${window.location.origin}${API_CONFIG.baseUrl}${API_CONFIG.endpoints.search}`);
      
      // Adicionar parâmetros de consulta
      if (options.bounds) {
        url.searchParams.append('south', options.bounds.south);
        url.searchParams.append('west', options.bounds.west);
        url.searchParams.append('north', options.bounds.north);
        url.searchParams.append('east', options.bounds.east);
      }
      if (options.query) {
        url.searchParams.append('query', options.query);
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
      return data.establishments || [];
    } catch (error) {
      console.error('Erro ao buscar estabelecimentos:', error);
      throw error;
    }
  }
  
  /**
   * Sincroniza estabelecimentos cadastrados localmente com o OpenStreetMap.
   * Esta função é usada pelo sistema para sincronizar em lote, sem interação do usuário.
   * 
   * @param {Array} [establishmentIds] - IDs dos estabelecimentos a sincronizar (opcional, se não fornecido sincroniza todos pendentes)
   * @returns {Promise<Object>} Resultado da operação
   */
  async syncWithOSM(establishmentIds = []) {
    try {
      console.log('Sincronizando estabelecimentos com OSM:', establishmentIds.length ? establishmentIds : 'todos pendentes');
      
      // Simulação de resposta para desenvolvimento (remover em produção)
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Sincronização com OSM concluída com sucesso (simulação)');
          resolve({
            success: true,
            message: 'Sincronização com OpenStreetMap concluída com sucesso',
            synced: establishmentIds.length || 'todos pendentes',
            details: {
              total: establishmentIds.length || 5,
              success: establishmentIds.length || 5,
              failed: 0
            }
          });
        }, 2000);
      });
      
      /* Código para ambiente de produção
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.sync}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ establishmentIds })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao sincronizar com OpenStreetMap');
      }
      
      return await response.json();
      */
    } catch (error) {
      console.error('Erro ao sincronizar com OpenStreetMap:', error);
      throw error;
    }
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
function findNearbyEstablishment(establishments, lat, lon, radius = 30) {
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
    const distance = getDistance(lat, lon, establishment.lat, establishment.lon);
    if (distance < radius && distance < minDistance) {
      minDistance = distance;
      nearestEstablishment = establishment;
    }
  }
  
  return nearestEstablishment;
}

// Exportar cliente para uso global
window.btcMapIntegration = new BTCMapIntegrationClient();
