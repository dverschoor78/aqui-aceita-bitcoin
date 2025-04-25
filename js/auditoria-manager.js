/**
 * Sistema de Auditoria - Aqui aceita Bitcoin?
 * 
 * Este arquivo contém funções para registrar, visualizar e analisar
 * ações realizadas no sistema, fornecendo um histórico completo
 * de todas as operações e mudanças.
 */

class AuditoriaManager {
    constructor() {
        // Inicializar variáveis
        this.auditLog = [];
        this.loadData();
    }
    
    /**
     * Carrega os dados do localStorage
     */
    loadData() {
        try {
            this.auditLog = JSON.parse(localStorage.getItem('auditLog') || '[]');
        } catch (error) {
            console.error('Erro ao carregar dados de auditoria:', error);
            this.auditLog = [];
        }
    }
    
    /**
     * Atualiza os dados
     */
    refreshData() {
        this.loadData();
    }
    
    /**
     * Registra uma ação no log de auditoria
     * @param {string} tipo - Tipo da ação (ex: Cadastro, Sincronização, Exclusão)
     * @param {string} descricao - Descrição detalhada da ação
     * @param {string} usuario - Nome do usuário que realizou a ação (padrão: 'Sistema')
     * @param {Object} detalhes - Detalhes adicionais da ação (opcional)
     */
    registrarAcao(tipo, descricao, usuario = 'Sistema', detalhes = null) {
        // Obter log atual
        this.refreshData();
        
        // Criar entrada de log
        const logEntry = {
            id: this.generateLogId(),
            data: new Date().toISOString(),
            tipo: tipo,
            descricao: descricao,
            usuario: usuario,
            detalhes: detalhes
        };
        
        // Adicionar ao log
        this.auditLog.push(logEntry);
        
        // Limitar tamanho do log (manter últimos 10000 registros)
        if (this.auditLog.length > 10000) {
            this.auditLog = this.auditLog.slice(-10000);
        }
        
        // Salvar no localStorage
        localStorage.setItem('auditLog', JSON.stringify(this.auditLog));
        
        return logEntry;
    }
    
    /**
     * Gera um ID único para entradas de log
     */
    generateLogId() {
        return 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Obtém todas as entradas de log
     * @param {number} limit - Limite de entradas a retornar (padrão: 100)
     * @param {number} offset - Deslocamento para paginação (padrão: 0)
     */
    obterLogs(limit = 100, offset = 0) {
        this.refreshData();
        
        // Ordenar por data (mais recente primeiro)
        const sortedLogs = [...this.auditLog].sort((a, b) => 
            new Date(b.data) - new Date(a.data)
        );
        
        // Aplicar paginação
        return sortedLogs.slice(offset, offset + limit);
    }
    
    /**
     * Filtra logs por tipo
     * @param {string} tipo - Tipo de ação a filtrar
     * @param {number} limit - Limite de entradas a retornar (padrão: 100)
     * @param {number} offset - Deslocamento para paginação (padrão: 0)
     */
    filtrarPorTipo(tipo, limit = 100, offset = 0) {
        this.refreshData();
        
        // Filtrar por tipo e ordenar por data (mais recente primeiro)
        const filteredLogs = this.auditLog
            .filter(log => log.tipo === tipo)
            .sort((a, b) => new Date(b.data) - new Date(a.data));
        
        // Aplicar paginação
        return filteredLogs.slice(offset, offset + limit);
    }
    
    /**
     * Filtra logs por usuário
     * @param {string} usuario - Nome do usuário
     * @param {number} limit - Limite de entradas a retornar (padrão: 100)
     * @param {number} offset - Deslocamento para paginação (padrão: 0)
     */
    filtrarPorUsuario(usuario, limit = 100, offset = 0) {
        this.refreshData();
        
        // Filtrar por usuário e ordenar por data (mais recente primeiro)
        const filteredLogs = this.auditLog
            .filter(log => log.usuario === usuario)
            .sort((a, b) => new Date(b.data) - new Date(a.data));
        
        // Aplicar paginação
        return filteredLogs.slice(offset, offset + limit);
    }
    
    /**
     * Filtra logs por período
     * @param {Date} dataInicio - Data de início
     * @param {Date} dataFim - Data de fim
     * @param {number} limit - Limite de entradas a retornar (padrão: 100)
     * @param {number} offset - Deslocamento para paginação (padrão: 0)
     */
    filtrarPorPeriodo(dataInicio, dataFim, limit = 100, offset = 0) {
        this.refreshData();
        
        // Converter para objetos Date se forem strings
        const inicio = dataInicio instanceof Date ? dataInicio : new Date(dataInicio);
        const fim = dataFim instanceof Date ? dataFim : new Date(dataFim);
        
        // Filtrar por período e ordenar por data (mais recente primeiro)
        const filteredLogs = this.auditLog
            .filter(log => {
                const logDate = new Date(log.data);
                return logDate >= inicio && logDate <= fim;
            })
            .sort((a, b) => new Date(b.data) - new Date(a.data));
        
        // Aplicar paginação
        return filteredLogs.slice(offset, offset + limit);
    }
    
    /**
     * Busca logs por texto na descrição
     * @param {string} texto - Texto a buscar
     * @param {number} limit - Limite de entradas a retornar (padrão: 100)
     * @param {number} offset - Deslocamento para paginação (padrão: 0)
     */
    buscarPorTexto(texto, limit = 100, offset = 0) {
        this.refreshData();
        
        // Buscar por texto na descrição e ordenar por data (mais recente primeiro)
        const filteredLogs = this.auditLog
            .filter(log => log.descricao.toLowerCase().includes(texto.toLowerCase()))
            .sort((a, b) => new Date(b.data) - new Date(a.data));
        
        // Aplicar paginação
        return filteredLogs.slice(offset, offset + limit);
    }
    
    /**
     * Obtém estatísticas de auditoria
     */
    obterEstatisticas() {
        this.refreshData();
        
        // Contar ações por tipo
        const acoesPorTipo = {};
        this.auditLog.forEach(log => {
            acoesPorTipo[log.tipo] = (acoesPorTipo[log.tipo] || 0) + 1;
        });
        
        // Contar ações por usuário
        const acoesPorUsuario = {};
        this.auditLog.forEach(log => {
            acoesPorUsuario[log.usuario] = (acoesPorUsuario[log.usuario] || 0) + 1;
        });
        
        // Contar ações por dia
        const acoesPorDia = {};
        this.auditLog.forEach(log => {
            const data = new Date(log.data).toISOString().split('T')[0];
            acoesPorDia[data] = (acoesPorDia[data] || 0) + 1;
        });
        
        // Obter últimos 30 dias
        const hoje = new Date();
        const ultimos30Dias = {};
        
        for (let i = 0; i < 30; i++) {
            const data = new Date(hoje);
            data.setDate(data.getDate() - i);
            const dataStr = data.toISOString().split('T')[0];
            ultimos30Dias[dataStr] = acoesPorDia[dataStr] || 0;
        }
        
        // Ordenar últimos 30 dias
        const acoesPorDiaOrdenado = Object.entries(ultimos30Dias)
            .sort(([dataA], [dataB]) => dataA.localeCompare(dataB))
            .reduce((obj, [data, count]) => {
                obj[data] = count;
                return obj;
            }, {});
        
        return {
            total: this.auditLog.length,
            acoesPorTipo,
            acoesPorUsuario,
            acoesPorDia: acoesPorDiaOrdenado,
            ultimaAcao: this.auditLog.length > 0 ? 
                this.auditLog.sort((a, b) => new Date(b.data) - new Date(a.data))[0] : 
                null
        };
    }
    
    /**
     * Exporta logs para formato CSV
     * @param {Array} logs - Logs a exportar (se não fornecido, exporta todos)
     */
    exportarCSV(logs = null) {
        const logsToExport = logs || this.auditLog;
        
        // Cabeçalho CSV
        let csv = 'ID,Data,Tipo,Descrição,Usuário\n';
        
        // Adicionar linhas
        logsToExport.forEach(log => {
            const data = new Date(log.data).toLocaleString();
            const descricao = log.descricao.replace(/"/g, '""'); // Escapar aspas
            
            csv += `"${log.id}","${data}","${log.tipo}","${descricao}","${log.usuario}"\n`;
        });
        
        return csv;
    }
    
    /**
     * Exporta logs para formato JSON
     * @param {Array} logs - Logs a exportar (se não fornecido, exporta todos)
     */
    exportarJSON(logs = null) {
        const logsToExport = logs || this.auditLog;
        return JSON.stringify(logsToExport, null, 2);
    }
    
    /**
     * Limpa logs antigos (mantém apenas os últimos X dias)
     * @param {number} dias - Número de dias a manter
     */
    limparLogsAntigos(dias = 90) {
        this.refreshData();
        
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - dias);
        
        // Filtrar logs mais recentes que a data limite
        const logsRecentes = this.auditLog.filter(log => 
            new Date(log.data) >= dataLimite
        );
        
        // Registrar a limpeza
        const removidos = this.auditLog.length - logsRecentes.length;
        if (removidos > 0) {
            logsRecentes.push({
                id: this.generateLogId(),
                data: new Date().toISOString(),
                tipo: 'Manutenção',
                descricao: `Limpeza automática: ${removidos} logs antigos removidos (mais de ${dias} dias)`,
                usuario: 'Sistema'
            });
        }
        
        // Atualizar logs
        this.auditLog = logsRecentes;
        
        // Salvar no localStorage
        localStorage.setItem('auditLog', JSON.stringify(this.auditLog));
        
        return removidos;
    }
}

// Exportar a classe para uso global
window.AuditoriaManager = AuditoriaManager;

// Inicializar o sistema de auditoria quando a página for carregada
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já existe uma instância do gerenciador de auditoria
    if (!window.auditoriaManagerInstance) {
        window.auditoriaManagerInstance = new AuditoriaManager();
        
        // Limpar logs antigos automaticamente (manter últimos 90 dias)
        window.auditoriaManagerInstance.limparLogsAntigos(90);
        
        // Configurar limpeza automática a cada 7 dias
        setInterval(() => {
            window.auditoriaManagerInstance.limparLogsAntigos(90);
        }, 7 * 24 * 60 * 60 * 1000); // 7 dias
    }
});
