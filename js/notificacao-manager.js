/**
 * Gerenciador de notificações para o sistema
 * 
 * Este script gerencia as notificações do sistema, incluindo
 * notificações de novos cadastros, aprovações e sincronização.
 */

class NotificacaoManager {
    constructor() {
        // Inicializar armazenamento de notificações se não existir
        if (!localStorage.getItem('notifications')) {
            localStorage.setItem('notifications', JSON.stringify([]));
        }
        
        // Contador de notificações não lidas
        this.unreadCount = 0;
        
        // Atualizar contador de notificações não lidas
        this.updateUnreadCount();
    }
    
    /**
     * Adicionar uma nova notificação
     * @param {string} title Título da notificação
     * @param {string} message Mensagem da notificação
     * @param {string} type Tipo da notificação (info, success, warning, error)
     * @returns {Object} Notificação criada
     */
    addNotification(title, message, type = 'info') {
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        
        // Criar nova notificação
        const notification = {
            id: Date.now().toString(),
            title: title,
            message: message,
            type: type,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        // Adicionar ao início da lista
        notifications.unshift(notification);
        
        // Manter apenas as últimas 50 notificações
        if (notifications.length > 50) {
            notifications.splice(50);
        }
        
        // Salvar no localStorage
        localStorage.setItem('notifications', JSON.stringify(notifications));
        
        // Atualizar contador de não lidas
        this.updateUnreadCount();
        
        // Disparar evento de nova notificação
        const event = new CustomEvent('newNotification', { detail: notification });
        document.dispatchEvent(event);
        
        return notification;
    }
    
    /**
     * Marcar uma notificação como lida
     * @param {string} id ID da notificação
     * @returns {boolean} True se a operação foi bem-sucedida
     */
    markAsRead(id) {
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        
        // Encontrar a notificação
        const index = notifications.findIndex(n => n.id === id);
        if (index === -1) {
            return false;
        }
        
        // Marcar como lida
        notifications[index].read = true;
        
        // Salvar no localStorage
        localStorage.setItem('notifications', JSON.stringify(notifications));
        
        // Atualizar contador de não lidas
        this.updateUnreadCount();
        
        return true;
    }
    
    /**
     * Marcar todas as notificações como lidas
     * @returns {boolean} True se a operação foi bem-sucedida
     */
    markAllAsRead() {
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        
        // Marcar todas como lidas
        notifications.forEach(n => n.read = true);
        
        // Salvar no localStorage
        localStorage.setItem('notifications', JSON.stringify(notifications));
        
        // Atualizar contador de não lidas
        this.updateUnreadCount();
        
        return true;
    }
    
    /**
     * Remover uma notificação
     * @param {string} id ID da notificação
     * @returns {boolean} True se a operação foi bem-sucedida
     */
    removeNotification(id) {
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        
        // Encontrar a notificação
        const index = notifications.findIndex(n => n.id === id);
        if (index === -1) {
            return false;
        }
        
        // Remover da lista
        notifications.splice(index, 1);
        
        // Salvar no localStorage
        localStorage.setItem('notifications', JSON.stringify(notifications));
        
        // Atualizar contador de não lidas
        this.updateUnreadCount();
        
        return true;
    }
    
    /**
     * Limpar todas as notificações
     * @returns {boolean} True se a operação foi bem-sucedida
     */
    clearAllNotifications() {
        // Salvar lista vazia no localStorage
        localStorage.setItem('notifications', JSON.stringify([]));
        
        // Atualizar contador de não lidas
        this.updateUnreadCount();
        
        return true;
    }
    
    /**
     * Obter todas as notificações
     * @param {number} limit Limite de notificações a retornar
     * @returns {Array} Lista de notificações
     */
    getNotifications(limit = 50) {
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        return notifications.slice(0, limit);
    }
    
    /**
     * Obter notificações não lidas
     * @returns {Array} Lista de notificações não lidas
     */
    getUnreadNotifications() {
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        return notifications.filter(n => !n.read);
    }
    
    /**
     * Atualizar contador de notificações não lidas
     * @returns {number} Número de notificações não lidas
     */
    updateUnreadCount() {
        const unreadNotifications = this.getUnreadNotifications();
        this.unreadCount = unreadNotifications.length;
        
        // Atualizar badge de notificações na interface
        const badge = document.getElementById('notification-badge');
        if (badge) {
            badge.textContent = this.unreadCount;
            badge.style.display = this.unreadCount > 0 ? 'block' : 'none';
        }
        
        return this.unreadCount;
    }
    
    /**
     * Notificar sobre novo estabelecimento cadastrado
     * @param {Object} establishment Dados do estabelecimento
     * @returns {Object} Notificação criada
     */
    notifyNewEstablishment(establishment) {
        return this.addNotification(
            'Novo Estabelecimento',
            `${establishment.name} foi cadastrado em ${establishment.municipality || 'localização desconhecida'}.`,
            'info'
        );
    }
    
    /**
     * Notificar sobre aprovação de estabelecimento
     * @param {Object} establishment Dados do estabelecimento
     * @returns {Object} Notificação criada
     */
    notifyApproval(establishment) {
        return this.addNotification(
            'Estabelecimento Aprovado',
            `${establishment.name} foi aprovado e está pronto para sincronização.`,
            'success'
        );
    }
    
    /**
     * Notificar sobre rejeição de estabelecimento
     * @param {Object} establishment Dados do estabelecimento
     * @param {string} reason Motivo da rejeição
     * @returns {Object} Notificação criada
     */
    notifyRejection(establishment, reason = '') {
        return this.addNotification(
            'Estabelecimento Rejeitado',
            `${establishment.name} foi rejeitado${reason ? `: ${reason}` : ''}.`,
            'warning'
        );
    }
    
    /**
     * Notificar sobre resultado de sincronização
     * @param {Object} result Resultado da sincronização
     * @returns {Object} Notificação criada
     */
    notifySyncResult(result) {
        const title = result.success ? 'Sincronização Concluída' : 'Falha na Sincronização';
        const type = result.success ? 'success' : 'error';
        
        return this.addNotification(
            title,
            result.message,
            type
        );
    }
}

// Inicializar o gerenciador de notificações
const notificacaoManager = new NotificacaoManager();

// Exportar para uso global
window.notificacaoManager = notificacaoManager;

// Adicionar listeners para eventos do sistema
document.addEventListener('DOMContentLoaded', function() {
    // Interceptar aprovações e rejeições para adicionar notificações
    if (window.cadastroManager) {
        // Backup das funções originais
        const originalApprove = window.cadastroManager.approveEstablishment;
        const originalReject = window.cadastroManager.rejectEstablishment;
        
        // Sobrescrever com versões que incluem notificações
        window.cadastroManager.approveEstablishment = function(id) {
            // Obter dados do estabelecimento antes da aprovação
            const pendingList = JSON.parse(localStorage.getItem('pendingEstablishments') || '[]');
            const establishment = pendingList.find(e => e.id === id);
            
            const result = originalApprove.call(this, id);
            
            if (result.success && establishment) {
                notificacaoManager.notifyApproval(establishment);
            }
            
            return result;
        };
        
        window.cadastroManager.rejectEstablishment = function(id, reason = '') {
            // Obter dados do estabelecimento antes da rejeição
            const pendingList = JSON.parse(localStorage.getItem('pendingEstablishments') || '[]');
            const establishment = pendingList.find(e => e.id === id);
            
            const result = originalReject.call(this, id);
            
            if (result.success && establishment) {
                notificacaoManager.notifyRejection(establishment, reason);
            }
            
            return result;
        };
    }
    
    // Interceptar eventos de sincronização
    document.addEventListener('syncStatusUpdated', function(event) {
        const status = event.detail;
        
        // Se a sincronização foi concluída, notificar o resultado
        if (status.inProgress === false && status.success !== null) {
            const result = {
                success: status.success,
                message: status.success 
                    ? `Sincronização concluída com sucesso: ${status.totalSuccess} estabelecimentos sincronizados.`
                    : `Falha na sincronização: ${status.totalFailed} estabelecimentos não puderam ser sincronizados.`
            };
            
            notificacaoManager.notifySyncResult(result);
        }
    });
    
    // Atualizar contador de notificações
    notificacaoManager.updateUnreadCount();
});
