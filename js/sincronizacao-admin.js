/**
 * Script para gerenciar a interface de sincronização com o OpenStreetMap
 * 
 * Este script implementa a funcionalidade da aba de sincronização na interface de administração,
 * permitindo iniciar sincronizações manuais, visualizar logs e configurar sincronização automática.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o serviço de sincronização está disponível
    if (!window.sincronizacaoOSMService) {
        console.error('Serviço de sincronização não encontrado');
        return;
    }
    
    // Elementos da interface
    const sincronizarBtn = document.getElementById('sincronizarBtn');
    const tentarNovamenteBtn = document.getElementById('tentarNovamenteBtn');
    const configurarSincronizacaoBtn = document.getElementById('configurarSincronizacaoBtn');
    const progressBar = document.getElementById('progressBar');
    const totalProcessados = document.getElementById('totalProcessados');
    const totalSucesso = document.getElementById('totalSucesso');
    const totalFalhas = document.getElementById('totalFalhas');
    const logSincronizacao = document.getElementById('logSincronizacao');
    const resultadosSincronizacao = document.getElementById('resultadosSincronizacao');
    const resultsContainer = document.getElementById('resultsContainer');
    const ultimaSincronizacao = document.getElementById('ultimaSincronizacao');
    const statusSincronizacao = document.getElementById('statusSincronizacao');
    const pendentesParaSincronizacao = document.getElementById('pendentesParaSincronizacao');
    
    // Atualizar status inicial
    atualizarStatusSincronizacao();
    
    // Adicionar listeners para eventos
    if (sincronizarBtn) {
        sincronizarBtn.addEventListener('click', iniciarSincronizacao);
    }
    
    if (tentarNovamenteBtn) {
        tentarNovamenteBtn.addEventListener('click', tentarNovamente);
    }
    
    if (configurarSincronizacaoBtn) {
        configurarSincronizacaoBtn.addEventListener('click', abrirModalConfiguracao);
    }
    
    // Listener para atualizações de status
    document.addEventListener('syncStatusUpdated', function(event) {
        atualizarStatusSincronizacao();
    });
    
    /**
     * Iniciar processo de sincronização
     */
    async function iniciarSincronizacao() {
        // Desabilitar botão durante a sincronização
        if (sincronizarBtn) {
            sincronizarBtn.disabled = true;
            sincronizarBtn.textContent = 'Sincronizando...';
        }
        
        try {
            // Limpar log
            if (logSincronizacao) {
                logSincronizacao.innerHTML = '';
            }
            
            // Adicionar entrada de log
            adicionarLogSincronizacao('Iniciando sincronização com OpenStreetMap...');
            
            // Iniciar sincronização
            const resultado = await window.sincronizacaoOSMService.startSync();
            
            // Atualizar status
            atualizarStatusSincronizacao();
            
            // Mostrar resultados
            exibirResultadosSincronizacao(resultado);
            
            // Adicionar entrada de log
            adicionarLogSincronizacao(
                `Sincronização concluída: ${resultado.message}`, 
                resultado.success ? 'success' : 'error'
            );
            
            // Notificar resultado
            if (window.notificacaoManager) {
                window.notificacaoManager.notifySyncResult(resultado);
            }
        } catch (erro) {
            console.error('Erro ao sincronizar:', erro);
            
            // Adicionar entrada de log
            adicionarLogSincronizacao(`Erro ao sincronizar: ${erro.message || 'Erro desconhecido'}`, 'error');
        } finally {
            // Reabilitar botão
            if (sincronizarBtn) {
                sincronizarBtn.disabled = false;
                sincronizarBtn.textContent = 'Sincronizar Agora';
            }
        }
    }
    
    /**
     * Tentar novamente sincronização de estabelecimentos que falharam
     */
    async function tentarNovamente() {
        // Desabilitar botão durante a sincronização
        if (tentarNovamenteBtn) {
            tentarNovamenteBtn.disabled = true;
            tentarNovamenteBtn.textContent = 'Tentando novamente...';
        }
        
        try {
            // Adicionar entrada de log
            adicionarLogSincronizacao('Tentando novamente sincronização de estabelecimentos que falharam...');
            
            // Tentar novamente
            const resultado = await window.sincronizacaoOSMService.retryFailedSync();
            
            // Atualizar status
            atualizarStatusSincronizacao();
            
            // Mostrar resultados
            exibirResultadosSincronizacao(resultado);
            
            // Adicionar entrada de log
            adicionarLogSincronizacao(
                `Tentativa concluída: ${resultado.message}`, 
                resultado.success ? 'success' : 'error'
            );
        } catch (erro) {
            console.error('Erro ao tentar novamente:', erro);
            
            // Adicionar entrada de log
            adicionarLogSincronizacao(`Erro ao tentar novamente: ${erro.message || 'Erro desconhecido'}`, 'error');
        } finally {
            // Reabilitar botão
            if (tentarNovamenteBtn) {
                tentarNovamenteBtn.disabled = false;
                tentarNovamenteBtn.textContent = 'Tentar Novamente';
            }
        }
    }
    
    /**
     * Abrir modal de configuração de sincronização automática
     */
    function abrirModalConfiguracao() {
        const modal = document.getElementById('syncConfigModal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Preencher campos com valores atuais
            const enableAutoSync = document.getElementById('modalEnableAutoSync');
            const syncInterval = document.getElementById('modalSyncInterval');
            
            if (enableAutoSync && syncInterval) {
                // Obter configurações atuais do localStorage
                const config = JSON.parse(localStorage.getItem('syncConfig') || '{"enableAutoSync":false,"syncInterval":30}');
                
                enableAutoSync.checked = config.enableAutoSync;
                syncInterval.value = config.syncInterval;
            }
            
            // Configurar botões do modal
            const cancelBtn = document.getElementById('cancelSyncConfig');
            const saveBtn = document.getElementById('saveSyncConfig');
            const closeBtn = document.getElementById('closeSyncConfigModal');
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', fecharModalConfiguracao);
            }
            
            if (closeBtn) {
                closeBtn.addEventListener('click', fecharModalConfiguracao);
            }
            
            if (saveBtn) {
                saveBtn.addEventListener('click', salvarConfiguracao);
            }
        }
    }
    
    /**
     * Fechar modal de configuração
     */
    function fecharModalConfiguracao() {
        const modal = document.getElementById('syncConfigModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    /**
     * Salvar configuração de sincronização automática
     */
    function salvarConfiguracao() {
        const enableAutoSync = document.getElementById('modalEnableAutoSync');
        const syncInterval = document.getElementById('modalSyncInterval');
        
        if (enableAutoSync && syncInterval) {
            // Validar intervalo
            const interval = parseInt(syncInterval.value);
            if (isNaN(interval) || interval < 5 || interval > 1440) {
                alert('O intervalo deve ser entre 5 e 1440 minutos.');
                return;
            }
            
            // Salvar configurações
            const config = {
                enableAutoSync: enableAutoSync.checked,
                syncInterval: interval
            };
            
            localStorage.setItem('syncConfig', JSON.stringify(config));
            
            // Adicionar log
            adicionarLogSincronizacao(
                `Configuração de sincronização automática ${config.enableAutoSync ? 'ativada' : 'desativada'} com intervalo de ${config.syncInterval} minutos.`,
                'info'
            );
            
            // Configurar timer de sincronização automática
            configurarSincronizacaoAutomatica(config);
            
            // Fechar modal
            fecharModalConfiguracao();
        }
    }
    
    /**
     * Configurar sincronização automática
     * @param {Object} config Configuração de sincronização
     */
    function configurarSincronizacaoAutomatica(config) {
        // Limpar timer existente
        if (window.autoSyncTimer) {
            clearInterval(window.autoSyncTimer);
            window.autoSyncTimer = null;
        }
        
        // Se a sincronização automática estiver ativada, configurar timer
        if (config.enableAutoSync) {
            // Converter minutos para milissegundos
            const interval = config.syncInterval * 60 * 1000;
            
            // Configurar timer
            window.autoSyncTimer = setInterval(async () => {
                // Verificar se já existe uma sincronização em andamento
                const status = window.sincronizacaoOSMService.getStatus();
                if (status.inProgress) {
                    console.log('Sincronização automática adiada: já existe uma sincronização em andamento');
                    return;
                }
                
                // Verificar se existem estabelecimentos para sincronizar
                const establishments = window.sincronizacaoOSMService.getEstablishmentsToSync();
                if (establishments.length === 0) {
                    console.log('Sincronização automática ignorada: não há estabelecimentos para sincronizar');
                    return;
                }
                
                // Adicionar log
                adicionarLogSincronizacao('Iniciando sincronização automática...', 'info');
                
                try {
                    // Iniciar sincronização
                    const resultado = await window.sincronizacaoOSMService.startSync();
                    
                    // Atualizar status
                    atualizarStatusSincronizacao();
                    
                    // Adicionar log
                    adicionarLogSincronizacao(
                        `Sincronização automática concluída: ${resultado.message}`,
                        resultado.success ? 'success' : 'error'
                    );
                    
                    // Notificar resultado
                    if (window.notificacaoManager) {
                        window.notificacaoManager.notifySyncResult(resultado);
                    }
                } catch (erro) {
                    console.error('Erro na sincronização automática:', erro);
                    
                    // Adicionar log
                    adicionarLogSincronizacao(`Erro na sincronização automática: ${erro.message || 'Erro desconhecido'}`, 'error');
                }
            }, interval);
            
            console.log(`Sincronização automática configurada com intervalo de ${config.syncInterval} minutos`);
        } else {
            console.log('Sincronização automática desativada');
        }
    }
    
    /**
     * Atualizar status de sincronização na interface
     */
    function atualizarStatusSincronizacao() {
        // Obter status atual
        const status = window.sincronizacaoOSMService.getStatus();
        
        // Atualizar última sincronização
        if (ultimaSincronizacao && status.lastSync) {
            const date = new Date(status.lastSync);
            ultimaSincronizacao.textContent = date.toLocaleString();
        } else if (ultimaSincronizacao) {
            ultimaSincronizacao.textContent = 'Nunca';
        }
        
        // Atualizar status
        if (statusSincronizacao) {
            if (status.inProgress) {
                statusSincronizacao.textContent = 'Em andamento';
                statusSincronizacao.className = 'status-badge status-pending';
            } else if (status.success === true) {
                statusSincronizacao.textContent = 'Sucesso';
                statusSincronizacao.className = 'status-badge status-approved';
            } else if (status.success === false) {
                statusSincronizacao.textContent = 'Falha';
                statusSincronizacao.className = 'status-badge status-rejected';
            } else {
                statusSincronizacao.textContent = 'Não iniciada';
                statusSincronizacao.className = 'status-badge';
            }
        }
        
        // Atualizar contadores
        if (totalProcessados) {
            totalProcessados.textContent = status.totalProcessed || 0;
        }
        
        if (totalSucesso) {
            totalSucesso.textContent = status.totalSuccess || 0;
        }
        
        if (totalFalhas) {
            totalFalhas.textContent = status.totalFailed || 0;
        }
        
        // Atualizar barra de progresso
        if (progressBar && status.totalProcessed > 0) {
            const progress = (status.totalSuccess / status.totalProcessed) * 100;
            progressBar.style.width = `${progress}%`;
        } else if (progressBar) {
            progressBar.style.width = '0%';
        }
        
        // Atualizar pendentes para sincronização
        if (pendentesParaSincronizacao) {
            const establishments = window.sincronizacaoOSMService.getEstablishmentsToSync();
            pendentesParaSincronizacao.textContent = establishments.length;
        }
        
        // Habilitar/desabilitar botão de tentar novamente
        if (tentarNovamenteBtn) {
            tentarNovamenteBtn.disabled = !status.failedSync || status.failedSync.length === 0 || status.inProgress;
        }
        
        // Habilitar/desabilitar botão de sincronização
        if (sincronizarBtn) {
            sincronizarBtn.disabled = status.inProgress;
        }
        
        // Atualizar logs
        atualizarLogsSincronizacao();
    }
    
    /**
     * Adicionar entrada de log à interface
     * @param {string} message Mensagem de log
     * @param {string} type Tipo de log (info, success, error, warning)
     */
    function adicionarLogSincronizacao(message, type = 'info') {
        if (!logSincronizacao) return;
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        logEntry.innerHTML = `<span class="log-time">[${timeStr}]</span> <span class="log-message">${message}</span>`;
        
        logSincronizacao.appendChild(logEntry);
        logSincronizacao.scrollTop = logSincronizacao.scrollHeight;
    }
    
    /**
     * Atualizar logs de sincronização na interface
     */
    function atualizarLogsSincronizacao() {
        if (!logSincronizacao) return;
        
        // Obter logs do serviço
        const status = window.sincronizacaoOSMService.getStatus();
        const logs = status.logs || [];
        
        // Limpar logs existentes
        logSincronizacao.innerHTML = '';
        
        // Adicionar logs à interface
        logs.forEach(log => {
            const date = new Date(log.timestamp);
            const timeStr = date.toLocaleTimeString();
            
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry log-${log.type}`;
            logEntry.innerHTML = `<span class="log-time">[${timeStr}]</span> <span class="log-message">${log.message}</span>`;
            
            logSincronizacao.appendChild(logEntry);
        });
        
        // Rolar para o final
        logSincronizacao.scrollTop = logSincronizacao.scrollHeight;
    }
    
    /**
     * Exibir resultados da sincronização na interface
     * @param {Object} resultado Resultado da sincronização
     */
    function exibirResultadosSincronizacao(resultado) {
        if (!resultadosSincronizacao || !resultsContainer) return;
        
        // Limpar resultados existentes
        resultadosSincronizacao.innerHTML = '';
        
        // Se não houver estabelecimentos processados, ocultar container
        if (!resultado.totalProcessed) {
            resultsContainer.style.display = 'none';
            return;
        }
        
        // Obter estabelecimentos aprovados
        const approvedList = JSON.parse(localStorage.getItem('approvedEstablishments') || '[]');
        
        // Adicionar linha para cada estabelecimento processado
        const status = window.sincronizacaoOSMService.getStatus();
        
        // Adicionar estabelecimentos com sucesso
        approvedList.forEach(establishment => {
            // Verificar se o estabelecimento foi processado na última sincronização
            if (establishment.syncDate && new Date(establishment.syncDate) > new Date(Date.now() - 60000)) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${establishment.name}</td>
                    <td><span class="status-badge status-approved">Sucesso</span></td>
                    <td>Sincronizado com sucesso</td>
                `;
                resultadosSincronizacao.appendChild(row);
            }
        });
        
        // Adicionar estabelecimentos com falha
        if (status.failedSync && status.failedSync.length > 0) {
            status.failedSync.forEach(id => {
                const establishment = approvedList.find(e => e.id === id);
                if (establishment) {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${establishment.name}</td>
                        <td><span class="status-badge status-rejected">Falha</span></td>
                        <td>Não foi possível sincronizar</td>
                    `;
                    resultadosSincronizacao.appendChild(row);
                }
            });
        }
        
        // Mostrar container
        resultsContainer.style.display = 'block';
    }
    
    // Carregar configuração de sincronização automática
    const config = JSON.parse(localStorage.getItem('syncConfig') || '{"enableAutoSync":false,"syncInterval":30}');
    configurarSincronizacaoAutomatica(config);
});
