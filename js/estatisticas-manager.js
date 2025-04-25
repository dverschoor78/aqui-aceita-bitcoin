/**
 * Gerenciador de Estatísticas - Aqui aceita Bitcoin?
 * 
 * Este arquivo contém funções para gerar estatísticas e relatórios
 * sobre os estabelecimentos cadastrados no sistema.
 */

class EstatisticasManager {
    constructor() {
        // Inicializar variáveis
        this.establishments = [];
        this.auditLog = [];
        
        // Carregar dados
        this.loadData();
    }
    
    /**
     * Carrega os dados do localStorage
     */
    loadData() {
        try {
            this.establishments = JSON.parse(localStorage.getItem('establishments') || '[]');
            this.auditLog = JSON.parse(localStorage.getItem('auditLog') || '[]');
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.establishments = [];
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
     * Retorna estatísticas gerais
     */
    getGeneralStats() {
        this.refreshData();
        
        const totalEstablishments = this.establishments.length;
        const pendingEstablishments = this.establishments.filter(e => e.status === 'pending').length;
        const syncedEstablishments = this.establishments.filter(e => e.status === 'synced').length;
        const verifiedEstablishments = this.establishments.filter(e => e.status === 'verified').length;
        
        // Calcular crescimento mensal
        const now = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        const establishmentsLastMonth = this.establishments.filter(e => {
            const cadastroDate = new Date(e.data_cadastro);
            return cadastroDate >= oneMonthAgo && cadastroDate <= now;
        }).length;
        
        // Calcular crescimento percentual
        let growthRate = 0;
        if (totalEstablishments > establishmentsLastMonth) {
            const previousTotal = totalEstablishments - establishmentsLastMonth;
            growthRate = previousTotal > 0 ? (establishmentsLastMonth / previousTotal) * 100 : 0;
        }
        
        // Categorias mais populares
        const categoryCounts = {};
        this.establishments.forEach(e => {
            categoryCounts[e.categoria] = (categoryCounts[e.categoria] || 0) + 1;
        });
        
        const topCategories = Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([categoria, count]) => ({ categoria, count }));
        
        // Cidades com mais estabelecimentos
        const cityCounts = {};
        this.establishments.forEach(e => {
            cityCounts[e.cidade] = (cityCounts[e.cidade] || 0) + 1;
        });
        
        const topCities = Object.entries(cityCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([cidade, count]) => ({ cidade, count }));
        
        return {
            total: totalEstablishments,
            pending: pendingEstablishments,
            synced: syncedEstablishments,
            verified: verifiedEstablishments,
            growthRate: Math.round(growthRate),
            monthlyNew: establishmentsLastMonth,
            topCategories,
            topCities
        };
    }
    
    /**
     * Retorna dados para gráfico de crescimento mensal
     */
    getMonthlyGrowthData() {
        this.refreshData();
        
        // Obter os últimos 12 meses
        const months = [];
        const counts = [];
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            
            const year = date.getFullYear();
            const month = date.getMonth();
            
            // Início do mês
            const startDate = new Date(year, month, 1);
            // Fim do mês
            const endDate = new Date(year, month + 1, 0);
            
            // Contar estabelecimentos cadastrados neste mês
            const monthlyCount = this.establishments.filter(e => {
                const cadastroDate = new Date(e.data_cadastro);
                return cadastroDate >= startDate && cadastroDate <= endDate;
            }).length;
            
            // Formatar nome do mês
            const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
            
            months.push(monthName);
            counts.push(monthlyCount);
        }
        
        return {
            labels: months,
            data: counts
        };
    }
    
    /**
     * Retorna dados para gráfico de distribuição por status
     */
    getStatusDistributionData() {
        this.refreshData();
        
        const pendingCount = this.establishments.filter(e => e.status === 'pending').length;
        const syncedCount = this.establishments.filter(e => e.status === 'synced').length;
        const verifiedCount = this.establishments.filter(e => e.status === 'verified').length;
        
        return {
            labels: ['Pendentes', 'Sincronizados', 'Verificados'],
            data: [pendingCount, syncedCount, verifiedCount],
            colors: ['#dc3545', '#fd7e14', '#28a745']
        };
    }
    
    /**
     * Retorna dados para gráfico de distribuição por cidade
     */
    getCityDistributionData() {
        this.refreshData();
        
        // Contar estabelecimentos por cidade
        const cityCounts = {};
        this.establishments.forEach(e => {
            cityCounts[e.cidade] = (cityCounts[e.cidade] || 0) + 1;
        });
        
        // Ordenar por contagem (decrescente)
        const sortedCities = Object.entries(cityCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Limitar a 10 cidades
        
        return {
            labels: sortedCities.map(([city]) => city),
            data: sortedCities.map(([, count]) => count)
        };
    }
    
    /**
     * Retorna dados para gráfico de distribuição por categoria
     */
    getCategoryDistributionData() {
        this.refreshData();
        
        // Contar estabelecimentos por categoria
        const categoryCounts = {};
        this.establishments.forEach(e => {
            categoryCounts[e.categoria] = (categoryCounts[e.categoria] || 0) + 1;
        });
        
        // Ordenar por contagem (decrescente)
        const sortedCategories = Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1]);
        
        return {
            labels: sortedCategories.map(([category]) => category),
            data: sortedCategories.map(([, count]) => count)
        };
    }
    
    /**
     * Retorna dados para gráfico de métodos de pagamento
     */
    getPaymentMethodsData() {
        this.refreshData();
        
        const lightningOnly = this.establishments.filter(e => e.lightning && !e.onchain).length;
        const onchainOnly = this.establishments.filter(e => !e.lightning && e.onchain).length;
        const both = this.establishments.filter(e => e.lightning && e.onchain).length;
        
        return {
            labels: ['Apenas Lightning', 'Apenas On-chain', 'Ambos'],
            data: [lightningOnly, onchainOnly, both]
        };
    }
    
    /**
     * Retorna dados de auditoria para relatórios
     */
    getAuditData() {
        this.refreshData();
        
        // Ordenar por data (mais recente primeiro)
        const sortedLogs = [...this.auditLog].sort((a, b) => 
            new Date(b.data) - new Date(a.data)
        );
        
        // Contar ações por tipo
        const actionCounts = {};
        this.auditLog.forEach(log => {
            actionCounts[log.tipo] = (actionCounts[log.tipo] || 0) + 1;
        });
        
        return {
            recentLogs: sortedLogs.slice(0, 50), // Últimos 50 registros
            actionCounts
        };
    }
    
    /**
     * Gera conteúdo para redes sociais com base nos dados
     */
    generateSocialMediaContent() {
        this.refreshData();
        
        const stats = this.getGeneralStats();
        const posts = [];
        
        // Post sobre total de estabelecimentos
        if (stats.total > 0) {
            posts.push({
                title: `Já são ${stats.total} estabelecimentos aceitando Bitcoin!`,
                content: `O projeto "Aqui aceita Bitcoin?" já conta com ${stats.total} estabelecimentos cadastrados que aceitam pagamentos em Bitcoin. Faça parte dessa revolução! #Bitcoin #AquiAceitaBitcoin #ClubeBRLN`,
                type: 'milestone'
            });
        }
        
        // Post sobre crescimento mensal
        if (stats.monthlyNew > 0) {
            posts.push({
                title: `+${stats.monthlyNew} novos estabelecimentos este mês!`,
                content: `Estamos crescendo! Só neste mês, ${stats.monthlyNew} novos estabelecimentos começaram a aceitar Bitcoin em nossa região. A revolução Bitcoin está acontecendo! #Bitcoin #Crescimento #AquiAceitaBitcoin`,
                type: 'growth'
            });
        }
        
        // Post sobre cidade com mais estabelecimentos
        if (stats.topCities.length > 0) {
            const topCity = stats.topCities[0];
            posts.push({
                title: `${topCity.cidade} lidera adoção de Bitcoin!`,
                content: `Com ${topCity.count} estabelecimentos, ${topCity.cidade} é a cidade com mais locais que aceitam Bitcoin em nossa região! Parabéns aos comerciantes pioneiros! #Bitcoin #${topCity.cidade.replace(/\s+/g, '')} #AquiAceitaBitcoin`,
                type: 'city'
            });
        }
        
        // Post sobre categoria mais popular
        if (stats.topCategories.length > 0) {
            const topCategory = stats.topCategories[0];
            posts.push({
                title: `${topCategory.categoria}s lideram adoção de Bitcoin!`,
                content: `Os estabelecimentos da categoria ${topCategory.categoria} são os que mais aceitam Bitcoin em nossa região, com ${topCategory.count} locais cadastrados! #Bitcoin #${topCategory.categoria} #AquiAceitaBitcoin`,
                type: 'category'
            });
        }
        
        // Post sobre estabelecimentos sincronizados
        if (stats.synced > 0) {
            posts.push({
                title: `${stats.synced} estabelecimentos já estão no BTC Maps!`,
                content: `Já são ${stats.synced} estabelecimentos da nossa região que aparecem no mapa global do BTC Maps! Encontre facilmente onde gastar seus bitcoins! #BTCMap #Bitcoin #AquiAceitaBitcoin`,
                type: 'synced'
            });
        }
        
        return posts;
    }
    
    /**
     * Programa geração automática de posts para redes sociais
     */
    scheduleSocialMediaPosts() {
        // Esta função seria implementada para programar posts automáticos
        // Por enquanto, apenas retorna os posts que seriam gerados
        return this.generateSocialMediaContent();
    }
}

// Exportar a classe para uso global
window.EstatisticasManager = EstatisticasManager;
