// Script para gerenciar o armazenamento de cadastros
class CadastroManager {
    constructor() {
        // Inicializar armazenamento se não existir
        if (!localStorage.getItem('pendingEstablishments')) {
            localStorage.setItem('pendingEstablishments', JSON.stringify([]));
        }
        if (!localStorage.getItem('approvedEstablishments')) {
            localStorage.setItem('approvedEstablishments', JSON.stringify([]));
        }
        if (!localStorage.getItem('rejectedEstablishments')) {
            localStorage.setItem('rejectedEstablishments', JSON.stringify([]));
        }
        if (!localStorage.getItem('systemLogs')) {
            localStorage.setItem('systemLogs', JSON.stringify([]));
        }
    }

    // Adicionar um novo estabelecimento pendente
    addPendingEstablishment(establishment) {
        const pendingList = JSON.parse(localStorage.getItem('pendingEstablishments') || '[]');
        
        // Gerar ID temporário
        establishment.id = 'TEMP-' + (pendingList.length + 1).toString().padStart(3, '0');
        establishment.status = 'pending';
        establishment.date = new Date().toISOString();
        
        // Adicionar à lista de pendentes
        pendingList.push(establishment);
        localStorage.setItem('pendingEstablishments', JSON.stringify(pendingList));
        
        // Adicionar log
        this.addLogEntry('Cadastro', `Novo estabelecimento cadastrado: ${establishment.name}`, 'Anônimo');
        
        return establishment.id;
    }

    // Aprovar um estabelecimento pendente
    approveEstablishment(id) {
        const pendingList = JSON.parse(localStorage.getItem('pendingEstablishments') || '[]');
        const establishmentIndex = pendingList.findIndex(e => e.id === id);
        
        if (establishmentIndex === -1) {
            return { success: false, message: 'Estabelecimento não encontrado' };
        }
        
        // Remover da lista de pendentes
        const establishment = pendingList.splice(establishmentIndex, 1)[0];
        localStorage.setItem('pendingEstablishments', JSON.stringify(pendingList));
        
        // Adicionar à lista de aprovados
        const approvedList = JSON.parse(localStorage.getItem('approvedEstablishments') || '[]');
        establishment.status = 'approved';
        establishment.approvalDate = new Date().toISOString();
        approvedList.push(establishment);
        localStorage.setItem('approvedEstablishments', JSON.stringify(approvedList));
        
        // Adicionar log
        this.addLogEntry('Aprovação', `Estabelecimento aprovado: ${establishment.name}`, 'admin');
        
        return { success: true, message: `Estabelecimento "${establishment.name}" aprovado com sucesso!` };
    }

    // Rejeitar um estabelecimento pendente
    rejectEstablishment(id) {
        const pendingList = JSON.parse(localStorage.getItem('pendingEstablishments') || '[]');
        const establishmentIndex = pendingList.findIndex(e => e.id === id);
        
        if (establishmentIndex === -1) {
            return { success: false, message: 'Estabelecimento não encontrado' };
        }
        
        // Remover da lista de pendentes
        const establishment = pendingList.splice(establishmentIndex, 1)[0];
        localStorage.setItem('pendingEstablishments', JSON.stringify(pendingList));
        
        // Adicionar à lista de rejeitados
        const rejectedList = JSON.parse(localStorage.getItem('rejectedEstablishments') || '[]');
        establishment.status = 'rejected';
        establishment.rejectionDate = new Date().toISOString();
        rejectedList.push(establishment);
        localStorage.setItem('rejectedEstablishments', JSON.stringify(rejectedList));
        
        // Adicionar log
        this.addLogEntry('Rejeição', `Estabelecimento rejeitado: ${establishment.name}`, 'admin');
        
        return { success: true, message: `Estabelecimento "${establishment.name}" rejeitado.` };
    }

    // Obter todos os estabelecimentos
    getAllEstablishments() {
        const pendingList = JSON.parse(localStorage.getItem('pendingEstablishments') || '[]');
        const approvedList = JSON.parse(localStorage.getItem('approvedEstablishments') || '[]');
        const rejectedList = JSON.parse(localStorage.getItem('rejectedEstablishments') || '[]');
        
        return {
            pending: pendingList,
            approved: approvedList,
            rejected: rejectedList,
            total: pendingList.length + approvedList.length
        };
    }

    // Obter estatísticas
    getStats() {
        const pendingList = JSON.parse(localStorage.getItem('pendingEstablishments') || '[]');
        const approvedList = JSON.parse(localStorage.getItem('approvedEstablishments') || '[]');
        const rejectedList = JSON.parse(localStorage.getItem('rejectedEstablishments') || '[]');
        
        // Contar estabelecimentos por município
        const municipalityCount = {
            'Ponta Grossa': 0,
            'Carambeí': 0,
            'Telêmaco Borba': 0,
            'Outros': 0
        };
        
        // Contar aprovados por município
        approvedList.forEach(e => {
            if (municipalityCount.hasOwnProperty(e.municipality)) {
                municipalityCount[e.municipality]++;
            } else {
                municipalityCount['Outros']++;
            }
        });
        
        // Contar estabelecimentos cadastrados hoje
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();
        
        const todayCount = pendingList.filter(e => {
            const date = new Date(e.date);
            return date.getTime() >= todayTimestamp;
        }).length;
        
        // Calcular taxa de aprovação
        const totalProcessed = approvedList.length + rejectedList.length;
        const approvalRate = totalProcessed > 0 
            ? Math.round((approvedList.length / totalProcessed) * 100) 
            : 0;
        
        return {
            total: approvedList.length,
            pending: pendingList.length,
            today: todayCount,
            approvalRate: approvalRate,
            municipalities: municipalityCount
        };
    }

    // Adicionar entrada de log
    addLogEntry(type, description, user = 'Sistema', ip = '127.0.0.1') {
        const logs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
        
        // Adicionar nova entrada
        logs.unshift({
            timestamp: new Date().toISOString(),
            type: type,
            description: description,
            user: user,
            ip: ip
        });
        
        // Manter apenas os últimos 100 logs
        if (logs.length > 100) {
            logs.splice(100);
        }
        
        localStorage.setItem('systemLogs', JSON.stringify(logs));
        return true;
    }

    // Obter logs do sistema
    getLogs(limit = 100, filter = null) {
        let logs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
        
        // Aplicar filtro se fornecido
        if (filter) {
            logs = logs.filter(log => {
                return log.type.toLowerCase().includes(filter.toLowerCase()) || 
                       log.description.toLowerCase().includes(filter.toLowerCase());
            });
        }
        
        // Limitar número de logs
        return logs.slice(0, limit);
    }

    // Exportar dados para CSV
    exportToCSV() {
        const establishments = this.getAllEstablishments();
        const allEstablishments = [
            ...establishments.approved.map(e => ({...e, status: 'Aprovado'})),
            ...establishments.pending.map(e => ({...e, status: 'Pendente'})),
            ...establishments.rejected.map(e => ({...e, status: 'Rejeitado'}))
        ];
        
        // Cabeçalhos CSV
        const headers = ['ID', 'Nome', 'Município', 'Endereço', 'Data', 'Status', 'Métodos Bitcoin'];
        
        // Linhas de dados
        const rows = allEstablishments.map(e => {
            const date = new Date(e.date);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
            
            return [
                e.id,
                e.name,
                e.municipality,
                e.address || 'Não informado',
                formattedDate,
                e.status,
                e.methods || 'Não informado'
            ];
        });
        
        // Combinar cabeçalhos e linhas
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        // Adicionar log
        this.addLogEntry('Exportação', 'Dados exportados para CSV', 'admin');
        
        return csvContent;
    }

    // Limpar dados (apenas para testes)
    clearAllData() {
        localStorage.removeItem('pendingEstablishments');
        localStorage.removeItem('approvedEstablishments');
        localStorage.removeItem('rejectedEstablishments');
        localStorage.setItem('pendingEstablishments', JSON.stringify([]));
        localStorage.setItem('approvedEstablishments', JSON.stringify([]));
        localStorage.setItem('rejectedEstablishments', JSON.stringify([]));
        
        // Adicionar log
        this.addLogEntry('Sistema', 'Todos os dados foram limpos', 'admin');
        
        return true;
    }
}

// Inicializar o gerenciador de cadastros
const cadastroManager = new CadastroManager();

// Exportar para uso global
window.cadastroManager = cadastroManager;
