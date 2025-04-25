/**
 * Serviço de sincronização com o OpenStreetMap - Versão Local
 * 
 * Este serviço gerencia a sincronização de estabelecimentos aprovados
 * com o OpenStreetMap através da API de integração local.
 * 
 * Esta versão é otimizada para uso local, sem depender de comunicação
 * entre diferentes origens e protocolos.
 */

class SincronizacaoOSMService {
    constructor() {
        // Inicializar armazenamento de status de sincronização se não existir
        if (!localStorage.getItem('syncStatus')) {
            localStorage.setItem('syncStatus', JSON.stringify({
                lastSync: null,
                inProgress: false,
                success: null,
                totalProcessed: 0,
                totalSuccess: 0,
                totalFailed: 0,
                pendingSync: [],
                failedSync: [],
                logs: []
            }));
        }
        
        // Configurar URL da API local diretamente
        this.apiBaseUrl = 'http://localhost:5000';
        
        // Adicionar log de inicialização
        this.addLog('info', 'Serviço de sincronização local inicializado');
        
        // Verificar disponibilidade da API
        this.checkApiAvailability();
    }

    /**
     * Obter a URL base da API
     * @returns {string} URL base da API
     */
    getApiUrl() {
        return this.apiBaseUrl;
    }

    /**
     * Definir a URL base da API
     * @param {string} url Nova URL base da API
     * @returns {boolean} true se a URL foi atualizada com sucesso
     */
    setApiUrl(url) {
        if (!url) return false;
        
        this.apiBaseUrl = url;
        localStorage.setItem('apiBaseUrl', url);
        this.addLog('info', `URL da API atualizada para: ${url}`);
        return true;
    }

    /**
     * Obter o status atual da sincronização
     * @returns {Object} Status atual da sincronização
     */
    getStatus() {
        return JSON.parse(localStorage.getItem('syncStatus') || '{}');
    }

    /**
     * Atualizar o status da sincronização
     * @param {Object} newStatus Novo status ou propriedades a atualizar
     */
    updateStatus(newStatus) {
        const currentStatus = this.getStatus();
        const updatedStatus = { ...currentStatus, ...newStatus };
        localStorage.setItem('syncStatus', JSON.stringify(updatedStatus));
        
        // Disparar evento de atualização de status
        const event = new CustomEvent('syncStatusUpdated', { detail: updatedStatus });
        document.dispatchEvent(event);
        
        return updatedStatus;
    }

    /**
     * Adicionar uma entrada de log à sincronização
     * @param {string} type Tipo de log (info, success, error, warning)
     * @param {string} message Mensagem de log
     */
    addLog(type, message) {
        const status = this.getStatus();
        const logs = status.logs || [];
        
        logs.unshift({
            timestamp: new Date().toISOString(),
            type: type,
            message: message
        });
        
        // Manter apenas os últimos 100 logs
        if (logs.length > 100) {
            logs.splice(100);
        }
        
        this.updateStatus({ logs });
        
        // Registrar também no sistema de auditoria
        if (window.auditoriaManager) {
            window.auditoriaManager.registrarAcao('Sincronização OSM', message, 'Sistema');
        }
        
        return true;
    }

    /**
     * Verificar se a API de integração está disponível
     * @returns {Promise<boolean>} Promessa que resolve para true se a API estiver disponível
     */
    async checkApiAvailability() {
        try {
            console.log(`Verificando disponibilidade da API local: ${this.apiBaseUrl}/health`);
            this.addLog('info', `Verificando disponibilidade da API local: ${this.apiBaseUrl}/health`);
            
            const response = await fetch(`${this.apiBaseUrl}/health`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                // Timeout de 5 segundos
                signal: AbortSignal.timeout(5000)
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('API respondeu:', data);
                this.addLog('success', 'API de integração local está disponível');
                
                // Verificar se a API tem credenciais configuradas
                if (data.api_key_configured) {
                    this.addLog('success', 'Chave de API do BTC Map configurada corretamente');
                } else if (data.osm_auth_configured) {
                    this.addLog('success', 'Autenticação OSM configurada corretamente');
                } else {
                    this.addLog('warning', 'Credenciais de autenticação não configuradas. A sincronização pode falhar.');
                }
                
                return true;
            } else {
                console.error(`API respondeu com status: ${response.status}`);
                this.addLog('error', `API de integração não está respondendo corretamente: ${response.status}`);
                return false;
            }
        } catch (error) {
            console.error('Erro ao verificar API:', error);
            this.addLog('error', `Erro ao verificar disponibilidade da API: ${error.message}`);
            
            // Mostrar mensagem de ajuda para o usuário
            this.addLog('info', 'Dica: Certifique-se de que a API está rodando em seu computador. Execute o comando:');
            this.addLog('info', 'python -m flask --app integration_api run --host=0.0.0.0 --port=5000');
            
            return false;
        }
    }

    /**
     * Iniciar processo de sincronização com o OpenStreetMap
     * @returns {Promise<Object>} Promessa que resolve para o resultado da sincronização
     */
    async startSync() {
        // Verificar se já existe uma sincronização em andamento
        const status = this.getStatus();
        if (status.inProgress) {
            this.addLog('warning', 'Já existe uma sincronização em andamento');
            return { success: false, message: 'Já existe uma sincronização em andamento' };
        }
        
        // Atualizar status para sincronização em andamento
        this.updateStatus({
            inProgress: true,
            success: null,
            totalProcessed: 0,
            totalSuccess: 0,
            totalFailed: 0,
            pendingSync: [],
            failedSync: []
        });
        
        this.addLog('info', 'Iniciando sincronização com OpenStreetMap');
        
        try {
            // Verificar disponibilidade da API
            const apiAvailable = await this.checkApiAvailability();
            if (!apiAvailable) {
                this.updateStatus({ inProgress: false, success: false });
                this.addLog('error', 'Sincronização cancelada: API não disponível');
                return { success: false, message: 'API não disponível' };
            }
            
            // Obter estabelecimentos aprovados que precisam ser sincronizados
            const establishments = this.getEstablishmentsToSync();
            
            if (establishments.length === 0) {
                this.updateStatus({
                    inProgress: false,
                    success: true,
                    lastSync: new Date().toISOString()
                });
                this.addLog('info', 'Nenhum estabelecimento para sincronizar');
                return { success: true, message: 'Nenhum estabelecimento para sincronizar' };
            }
            
            // Atualizar status com estabelecimentos pendentes
            this.updateStatus({
                pendingSync: establishments.map(e => e.id)
            });
            
            this.addLog('info', `${establishments.length} estabelecimentos para sincronizar`);
            
            // Processar cada estabelecimento
            const results = await this.processEstablishments(establishments);
            
            // Atualizar status final
            this.updateStatus({
                inProgress: false,
                success: results.totalFailed === 0,
                lastSync: new Date().toISOString(),
                totalProcessed: results.totalProcessed,
                totalSuccess: results.totalSuccess,
                totalFailed: results.totalFailed,
                pendingSync: [],
                failedSync: results.failedSync
            });
            
            // Registrar resultado no sistema de auditoria
            if (window.auditoriaManager) {
                window.auditoriaManager.registrarSincronizacao(
                    results.totalFailed === 0 ? 'sucesso' : 'parcial',
                    results.totalSuccess
                );
            }
            
            this.addLog(
                results.totalFailed === 0 ? 'success' : 'warning',
                `Sincronização concluída: ${results.totalSuccess} sucesso, ${results.totalFailed} falhas`
            );
            
            return {
                success: results.totalFailed === 0,
                message: `Sincronização concluída: ${results.totalSuccess} sucesso, ${results.totalFailed} falhas`,
                ...results
            };
        } catch (error) {
            console.error('Erro durante sincronização:', error);
            this.updateStatus({
                inProgress: false,
                success: false
            });
            
            this.addLog('error', `Erro durante sincronização: ${error.message}`);
            
            // Registrar falha no sistema de auditoria
            if (window.auditoriaManager) {
                window.auditoriaManager.registrarSincronizacao('erro', 0);
            }
            
            return { success: false, message: `Erro durante sincronização: ${error.message}` };
        }
    }

    /**
     * Obter estabelecimentos aprovados que precisam ser sincronizados com o OSM
     * @returns {Array} Lista de estabelecimentos para sincronizar
     */
    getEstablishmentsToSync() {
        // Obter estabelecimentos aprovados do localStorage
        const approvedList = JSON.parse(localStorage.getItem('approvedEstablishments') || '[]');
        
        // Filtrar apenas os que não têm osm_id ou têm osm_id mas precisam de atualização
        return approvedList.filter(e => {
            // Se não tem osm_id, precisa ser sincronizado
            if (!e.osm_id) {
                return true;
            }
            
            // Se tem osm_id e flag de needsUpdate, precisa ser atualizado
            if (e.osm_id && e.needsUpdate) {
                return true;
            }
            
            return false;
        });
    }

    /**
     * Processar lista de estabelecimentos para sincronização
     * @param {Array} establishments Lista de estabelecimentos para sincronizar
     * @returns {Promise<Object>} Promessa que resolve para o resultado do processamento
     */
    async processEstablishments(establishments) {
        const results = {
            totalProcessed: establishments.length,
            totalSuccess: 0,
            totalFailed: 0,
            failedSync: []
        };
        
        // Processar cada estabelecimento sequencialmente
        for (const establishment of establishments) {
            try {
                // Atualizar status para mostrar progresso
                this.updateStatus({
                    totalProcessed: results.totalProcessed,
                    totalSuccess: results.totalSuccess,
                    totalFailed: results.totalFailed,
                    pendingSync: establishments
                        .slice(establishments.indexOf(establishment) + 1)
                        .map(e => e.id)
                });
                
                this.addLog('info', `Processando estabelecimento: ${establishment.name}`);
                
                // Verificar se é um novo estabelecimento ou atualização
                if (!establishment.osm_id) {
                    // Novo estabelecimento
                    await this.addEstablishmentToOSM(establishment);
                    results.totalSuccess++;
                    this.addLog('success', `Estabelecimento adicionado com sucesso: ${establishment.name}`);
                } else {
                    // Atualização de estabelecimento existente
                    await this.updateEstablishmentInOSM(establishment);
                    results.totalSuccess++;
                    this.addLog('success', `Estabelecimento atualizado com sucesso: ${establishment.name}`);
                }
            } catch (error) {
                results.totalFailed++;
                results.failedSync.push(establishment.id);
                this.addLog('error', `Falha ao sincronizar estabelecimento ${establishment.name}: ${error.message}`);
            }
        }
        
        return results;
    }

    /**
     * Adicionar um novo estabelecimento ao OpenStreetMap
     * @param {Object} establishment Dados do estabelecimento
     * @returns {Promise<Object>} Promessa que resolve para o resultado da operação
     */
    async addEstablishmentToOSM(establishment) {
        try {
            // Preparar dados para a API
            const establishmentData = this.prepareEstablishmentData(establishment);
            
            // Enviar para a API
            const response = await fetch(`${this.apiBaseUrl}/establishments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(establishmentData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ${response.status}`);
            }
            
            const result = await response.json();
            
            // Atualizar o estabelecimento no localStorage com o osm_id
            this.updateEstablishmentAfterSync(establishment.id, {
                osm_id: result.data.id,
                syncDate: new Date().toISOString(),
                needsUpdate: false
            });
            
            return result;
        } catch (error) {
            console.error('Erro ao adicionar estabelecimento ao OSM:', error);
            throw error;
        }
    }

    /**
     * Atualizar um estabelecimento existente no OpenStreetMap
     * @param {Object} establishment Dados do estabelecimento
     * @returns {Promise<Object>} Promessa que resolve para o resultado da operação
     */
    async updateEstablishmentInOSM(establishment) {
        try {
            // Preparar dados para a API
            const establishmentData = this.prepareEstablishmentData(establishment);
            
            // Enviar para a API
            const response = await fetch(`${this.apiBaseUrl}/establishments/${establishment.osm_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(establishmentData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ${response.status}`);
            }
            
            const result = await response.json();
            
            // Atualizar o estabelecimento no localStorage
            this.updateEstablishmentAfterSync(establishment.id, {
                syncDate: new Date().toISOString(),
                needsUpdate: false
            });
            
            return result;
        } catch (error) {
            console.error('Erro ao atualizar estabelecimento no OSM:', error);
            throw error;
        }
    }

    /**
     * Preparar dados do estabelecimento para envio à API
     * @param {Object} establishment Dados do estabelecimento
     * @returns {Object} Dados formatados para a API
     */
    prepareEstablishmentData(establishment) {
        // Dados básicos
        const data = {
            name: establishment.name,
            lat: parseFloat(establishment.lat),
            lon: parseFloat(establishment.lon),
            accepts_lightning: establishment.accepts_lightning || false,
            accepts_onchain: establishment.accepts_onchain || true
        };
        
        // Dados opcionais
        if (establishment.address) data.address = establishment.address;
        if (establishment.website) data.website = establishment.website;
        if (establishment.phone) data.phone = establishment.phone;
        if (establishment.description) data.description = establishment.description;
        
        // Tags específicas para o BTC Map
        data.tags = {
            'currency:XBT': 'yes',
            'check_date:currency:XBT': new Date().toISOString().split('T')[0].replace(/-/g, '/'),
            'source': 'Aqui aceita Bitcoin?'
        };
        
        // Adicionar tags específicas para métodos de pagamento
        if (establishment.accepts_lightning) {
            data.tags['payment:lightning'] = 'yes';
        }
        
        if (establishment.accepts_onchain) {
            data.tags['payment:onchain'] = 'yes';
        }
        
        return data;
    }

    /**
     * Atualizar um estabelecimento no localStorage após sincronização
     * @param {string} id ID do estabelecimento
     * @param {Object} updateData Dados a serem atualizados
     */
    updateEstablishmentAfterSync(id, updateData) {
        // Obter lista de estabelecimentos aprovados
        const approvedList = JSON.parse(localStorage.getItem('approvedEstablishments') || '[]');
        
        // Encontrar e atualizar o estabelecimento
        const updatedList = approvedList.map(e => {
            if (e.id === id) {
                return { ...e, ...updateData };
            }
            return e;
        });
        
        // Salvar lista atualizada
        localStorage.setItem('approvedEstablishments', JSON.stringify(updatedList));
    }

    /**
     * Tentar novamente sincronização de estabelecimentos que falharam
     * @returns {Promise<Object>} Promessa que resolve para o resultado da sincronização
     */
    async retryFailedSync() {
        // Verificar se já existe uma sincronização em andamento
        const status = this.getStatus();
        if (status.inProgress) {
            this.addLog('warning', 'Já existe uma sincronização em andamento');
            return { success: false, message: 'Já existe uma sincronização em andamento' };
        }
        
        // Verificar se existem estabelecimentos que falharam
        if (!status.failedSync || status.failedSync.length === 0) {
            this.addLog('warning', 'Não há estabelecimentos com falha para tentar novamente');
            return { success: false, message: 'Não há estabelecimentos com falha para tentar novamente' };
        }
        
        // Atualizar status para sincronização em andamento
        this.updateStatus({
            inProgress: true,
            success: null,
            totalProcessed: 0,
            totalSuccess: 0,
            totalFailed: 0,
            pendingSync: status.failedSync,
            failedSync: []
        });
        
        this.addLog('info', 'Tentando novamente sincronização de estabelecimentos que falharam');
        
        try {
            // Verificar disponibilidade da API
            const apiAvailable = await this.checkApiAvailability();
            if (!apiAvailable) {
                this.updateStatus({ inProgress: false, success: false });
                this.addLog('error', 'Tentativa cancelada: API não disponível');
                return { success: false, message: 'API não disponível' };
            }
            
            // Obter estabelecimentos que falharam
            const approvedList = JSON.parse(localStorage.getItem('approvedEstablishments') || '[]');
            const failedEstablishments = approvedList.filter(e => status.failedSync.includes(e.id));
            
            if (failedEstablishments.length === 0) {
                this.updateStatus({
                    inProgress: false,
                    success: true,
                    failedSync: []
                });
                this.addLog('info', 'Nenhum estabelecimento para tentar novamente');
                return { success: true, message: 'Nenhum estabelecimento para tentar novamente' };
            }
            
            // Processar cada estabelecimento
            const results = await this.processEstablishments(failedEstablishments);
            
            // Atualizar status final
            this.updateStatus({
                inProgress: false,
                success: results.totalFailed === 0,
                lastSync: new Date().toISOString(),
                totalProcessed: results.totalProcessed,
                totalSuccess: results.totalSuccess,
                totalFailed: results.totalFailed,
                pendingSync: [],
                failedSync: results.failedSync
            });
            
            this.addLog(
                results.totalFailed === 0 ? 'success' : 'warning',
                `Tentativa concluída: ${results.totalSuccess} sucesso, ${results.totalFailed} falhas`
            );
            
            return {
                success: results.totalFailed === 0,
                message: `Tentativa concluída: ${results.totalSuccess} sucesso, ${results.totalFailed} falhas`,
                ...results
            };
        } catch (error) {
            console.error('Erro durante tentativa:', error);
            this.updateStatus({
                inProgress: false,
                success: false
            });
            
            this.addLog('error', `Erro durante tentativa: ${error.message}`);
            
            return { success: false, message: `Erro durante tentativa: ${error.message}` };
        }
    }
}

// Inicializar serviço de sincronização
window.sincronizacaoOSMService = new SincronizacaoOSMService();
