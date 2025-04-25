/**
 * Gerador Automático de Conteúdo para Redes Sociais - Aqui aceita Bitcoin?
 * 
 * Este arquivo contém funções para gerar automaticamente conteúdo para redes sociais
 * com base nos dados dos estabelecimentos cadastrados no sistema.
 */

class SocialMediaGenerator {
    constructor() {
        // Inicializar variáveis
        this.establishments = [];
        this.auditLog = [];
        this.estatisticasManager = new EstatisticasManager();
        this.lastGeneratedDate = localStorage.getItem('lastPostGeneration') || null;
        
        // Templates para diferentes tipos de posts
        this.templates = {
            twitter: {
                milestone: [
                    "🎉 Já são {total} estabelecimentos aceitando #Bitcoin na nossa região! 🚀 #AquiAceitaBitcoin #ClubeBRLN",
                    "🔥 Chegamos a {total} estabelecimentos que aceitam #Bitcoin! A revolução financeira está acontecendo! #AquiAceitaBitcoin",
                    "📈 {total} estabelecimentos já aceitam #Bitcoin em nossa região! Faça parte dessa revolução! #AquiAceitaBitcoin #ClubeBRLN"
                ],
                growth: [
                    "📊 +{monthlyNew} novos estabelecimentos aceitando #Bitcoin só neste mês! O futuro é agora! #AquiAceitaBitcoin",
                    "🚀 Crescimento de {growthRate}% na adoção de #Bitcoin! +{monthlyNew} novos estabelecimentos este mês! #AquiAceitaBitcoin",
                    "⚡ +{monthlyNew} novos estabelecimentos começaram a aceitar #Bitcoin este mês! A rede está crescendo! #AquiAceitaBitcoin"
                ],
                city: [
                    "🏙️ {topCity} lidera com {cityCount} estabelecimentos que aceitam #Bitcoin! #AquiAceitaBitcoin #{cityHashtag}",
                    "🥇 {topCity} é a cidade com mais locais que aceitam #Bitcoin: {cityCount} estabelecimentos! #AquiAceitaBitcoin",
                    "🌆 {topCity} está na vanguarda da adoção de #Bitcoin com {cityCount} estabelecimentos! #AquiAceitaBitcoin #{cityHashtag}"
                ],
                category: [
                    "🍽️ {topCategory}s lideram a adoção de #Bitcoin com {categoryCount} estabelecimentos! #AquiAceitaBitcoin",
                    "🏆 Categoria mais popular: {topCategory} com {categoryCount} estabelecimentos aceitando #Bitcoin! #AquiAceitaBitcoin",
                    "⭐ Os {topCategory}s estão abraçando o #Bitcoin! Já são {categoryCount} na nossa região! #AquiAceitaBitcoin"
                ],
                synced: [
                    "🗺️ {synced} estabelecimentos da nossa região já estão no mapa global do #BTCMap! #Bitcoin #AquiAceitaBitcoin",
                    "🌎 Encontre {synced} estabelecimentos da nossa região no #BTCMap! #Bitcoin #AquiAceitaBitcoin",
                    "🔍 {synced} estabelecimentos sincronizados com o #BTCMap! Encontre facilmente onde gastar seus #Bitcoin!"
                ]
            },
            facebook: {
                milestone: [
                    "🎉 GRANDE MARCO ALCANÇADO! 🎉\n\nJá são {total} estabelecimentos aceitando Bitcoin na nossa região! A revolução financeira está acontecendo e você pode fazer parte dela.\n\nConheça os locais e comece a usar Bitcoin hoje mesmo!\n\n#AquiAceitaBitcoin #ClubeBRLN #Bitcoin",
                    "🚀 ESTAMOS CRESCENDO! 🚀\n\nAcabamos de atingir a marca de {total} estabelecimentos que aceitam Bitcoin em nossa região! Isso mostra como a adoção está acelerando.\n\nQuer fazer parte dessa revolução? Acesse nosso site e saiba como!\n\n#AquiAceitaBitcoin #Bitcoin #AdoçãoBitcoin"
                ],
                growth: [
                    "📈 CRESCIMENTO IMPRESSIONANTE! 📈\n\nSó neste mês, {monthlyNew} novos estabelecimentos começaram a aceitar Bitcoin em nossa região, representando um crescimento de {growthRate}%!\n\nA revolução Bitcoin está acontecendo agora. Não fique de fora!\n\n#AquiAceitaBitcoin #Bitcoin #Crescimento",
                    "⚡ ADOÇÃO ACELERANDO! ⚡\n\n+{monthlyNew} novos estabelecimentos aceitando Bitcoin este mês! Estamos vendo um crescimento constante na adoção de Bitcoin como meio de pagamento.\n\nSua empresa já aceita Bitcoin? Entre em contato conosco e faça parte dessa revolução!\n\n#AquiAceitaBitcoin #Bitcoin #MeiosDePagamento"
                ],
                city: [
                    "🏙️ {topCity} LIDERA A ADOÇÃO DE BITCOIN! 🏙️\n\nCom {cityCount} estabelecimentos, {topCity} é a cidade com mais locais que aceitam Bitcoin em nossa região!\n\nParabéns aos comerciantes pioneiros que estão na vanguarda da revolução financeira!\n\nConfira o mapa completo em nosso site.\n\n#Bitcoin #{cityHashtag} #AquiAceitaBitcoin",
                    "🥇 {topCity} NA LIDERANÇA! 🥇\n\n{topCity} se destaca com {cityCount} estabelecimentos que já aceitam Bitcoin como forma de pagamento!\n\nQuer conhecer esses estabelecimentos? Acesse nosso site e confira o mapa completo.\n\n#Bitcoin #{cityHashtag} #AquiAceitaBitcoin"
                ],
                category: [
                    "🍽️ {topCategory}S ABRAÇAM O BITCOIN! 🍽️\n\nOs estabelecimentos da categoria {topCategory} são os que mais aceitam Bitcoin em nossa região, com {categoryCount} locais cadastrados!\n\nQuer saber onde gastar seus bitcoins? Confira nossa lista completa no site.\n\n#Bitcoin #{categoryHashtag} #AquiAceitaBitcoin",
                    "🏆 CATEGORIA DESTAQUE: {topCategory}! 🏆\n\nCom {categoryCount} estabelecimentos, a categoria {topCategory} lidera a adoção de Bitcoin em nossa região!\n\nQue tal experimentar pagar com Bitcoin no seu {topCategory} favorito?\n\n#Bitcoin #{categoryHashtag} #AquiAceitaBitcoin"
                ],
                synced: [
                    "🗺️ NO MAPA GLOBAL! 🗺️\n\nJá são {synced} estabelecimentos da nossa região que aparecem no mapa global do BTC Maps!\n\nIsso significa que pessoas do mundo todo podem encontrar facilmente onde gastar seus bitcoins quando visitarem nossa região.\n\nSeu estabelecimento já está no mapa? Cadastre-se em nosso site!\n\n#BTCMap #Bitcoin #AquiAceitaBitcoin",
                    "🌎 VISIBILIDADE GLOBAL! 🌎\n\n{synced} estabelecimentos da nossa região já estão sincronizados com o BTC Maps, o maior mapa global de locais que aceitam Bitcoin!\n\nIsso coloca nossa região no mapa da revolução Bitcoin mundial.\n\nQuer fazer parte? Cadastre seu estabelecimento hoje mesmo!\n\n#BTCMap #Bitcoin #AquiAceitaBitcoin"
                ]
            },
            instagram: {
                milestone: [
                    "🎉 CELEBRANDO UM MARCO! 🎉\n\nJá são {total} estabelecimentos aceitando Bitcoin na nossa região!\n\nA revolução financeira está acontecendo e você pode fazer parte dela.\n\nLink na bio para conhecer todos os locais!\n\n.\n.\n.\n#AquiAceitaBitcoin #ClubeBRLN #Bitcoin #Criptomoedas #RevoluçãoFinanceira #MeiosDePagamento",
                    "🚀 {total} ESTABELECIMENTOS E CONTANDO! 🚀\n\nA adoção de Bitcoin como meio de pagamento não para de crescer em nossa região!\n\nJá são {total} estabelecimentos aceitando a moeda do futuro.\n\nSeu negócio será o próximo?\n\n.\n.\n.\n#AquiAceitaBitcoin #Bitcoin #AdoçãoBitcoin #ComércioLocal #Inovação #TecnologiaFinanceira"
                ],
                growth: [
                    "📈 CRESCIMENTO IMPRESSIONANTE! 📈\n\n+{monthlyNew} novos estabelecimentos aceitando Bitcoin este mês!\n\nIsso representa um crescimento de {growthRate}%!\n\nA revolução Bitcoin está acontecendo agora.\n\n.\n.\n.\n#AquiAceitaBitcoin #Bitcoin #Crescimento #Adoção #Inovação #MeiosDePagamento",
                    "⚡ ADOÇÃO ACELERANDO! ⚡\n\nSó neste mês, {monthlyNew} novos estabelecimentos começaram a aceitar Bitcoin!\n\nEstamos vendo um crescimento constante na adoção de Bitcoin como meio de pagamento.\n\nSua empresa já aceita Bitcoin?\n\n.\n.\n.\n#AquiAceitaBitcoin #Bitcoin #Crescimento #Inovação #ComércioLocal #TecnologiaFinanceira"
                ],
                city: [
                    "🏙️ {topCity} LIDERA! 🏙️\n\nCom {cityCount} estabelecimentos, {topCity} é a cidade com mais locais que aceitam Bitcoin em nossa região!\n\nParabéns aos comerciantes pioneiros!\n\n.\n.\n.\n#Bitcoin #{cityHashtag} #AquiAceitaBitcoin #ComércioLocal #Inovação #CidadeInteligente",
                    "🥇 {topCity} NA VANGUARDA! 🥇\n\n{topCity} se destaca com {cityCount} estabelecimentos que já aceitam Bitcoin!\n\nQuer conhecer esses estabelecimentos? Link na bio!\n\n.\n.\n.\n#Bitcoin #{cityHashtag} #AquiAceitaBitcoin #ComércioLocal #Inovação #MeiosDePagamento"
                ],
                category: [
                    "🍽️ {topCategory}S ABRAÇAM O BITCOIN! 🍽️\n\nOs {topCategory}s são os que mais aceitam Bitcoin em nossa região!\n\nJá são {categoryCount} estabelecimentos nesta categoria!\n\n.\n.\n.\n#Bitcoin #{categoryHashtag} #AquiAceitaBitcoin #Inovação #MeiosDePagamento #ComércioLocal",
                    "🏆 CATEGORIA DESTAQUE: {topCategory}! 🏆\n\nCom {categoryCount} estabelecimentos, a categoria {topCategory} lidera a adoção de Bitcoin!\n\nQue tal experimentar pagar com Bitcoin no seu {topCategory} favorito?\n\n.\n.\n.\n#Bitcoin #{categoryHashtag} #AquiAceitaBitcoin #Inovação #ComércioLocal #MeiosDePagamento"
                ],
                synced: [
                    "🗺️ NO MAPA GLOBAL! 🗺️\n\nJá são {synced} estabelecimentos da nossa região no mapa global do BTC Maps!\n\nIsso coloca nossa região no mapa da revolução Bitcoin mundial.\n\n.\n.\n.\n#BTCMap #Bitcoin #AquiAceitaBitcoin #MapaGlobal #Turismo #ComércioLocal",
                    "🌎 VISIBILIDADE GLOBAL! 🌎\n\n{synced} estabelecimentos sincronizados com o BTC Maps!\n\nAgora pessoas do mundo todo podem encontrar onde gastar seus bitcoins em nossa região!\n\n.\n.\n.\n#BTCMap #Bitcoin #AquiAceitaBitcoin #MapaGlobal #Turismo #Inovação"
                ]
            }
        };
    }
    
    /**
     * Carrega os dados necessários
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
     * Seleciona aleatoriamente um template da lista
     */
    getRandomTemplate(platform, type) {
        const templates = this.templates[platform][type];
        const randomIndex = Math.floor(Math.random() * templates.length);
        return templates[randomIndex];
    }
    
    /**
     * Substitui placeholders no template com valores reais
     */
    fillTemplate(template, data) {
        let filledTemplate = template;
        
        // Substituir placeholders
        if (template.includes('{total}')) {
            filledTemplate = filledTemplate.replace(/{total}/g, data.total);
        }
        
        if (template.includes('{monthlyNew}')) {
            filledTemplate = filledTemplate.replace(/{monthlyNew}/g, data.monthlyNew);
        }
        
        if (template.includes('{growthRate}')) {
            filledTemplate = filledTemplate.replace(/{growthRate}/g, data.growthRate);
        }
        
        if (template.includes('{topCity}')) {
            filledTemplate = filledTemplate.replace(/{topCity}/g, data.topCity);
        }
        
        if (template.includes('{cityCount}')) {
            filledTemplate = filledTemplate.replace(/{cityCount}/g, data.cityCount);
        }
        
        if (template.includes('{cityHashtag}')) {
            const cityHashtag = data.topCity.replace(/\s+/g, '');
            filledTemplate = filledTemplate.replace(/{cityHashtag}/g, cityHashtag);
        }
        
        if (template.includes('{topCategory}')) {
            filledTemplate = filledTemplate.replace(/{topCategory}/g, data.topCategory);
        }
        
        if (template.includes('{categoryCount}')) {
            filledTemplate = filledTemplate.replace(/{categoryCount}/g, data.categoryCount);
        }
        
        if (template.includes('{categoryHashtag}')) {
            const categoryHashtag = data.topCategory.replace(/\s+/g, '');
            filledTemplate = filledTemplate.replace(/{categoryHashtag}/g, categoryHashtag);
        }
        
        if (template.includes('{synced}')) {
            filledTemplate = filledTemplate.replace(/{synced}/g, data.synced);
        }
        
        return filledTemplate;
    }
    
    /**
     * Gera posts para uma plataforma específica
     */
    generatePostsForPlatform(platform) {
        this.loadData();
        const stats = this.estatisticasManager.getGeneralStats();
        const posts = [];
        
        // Dados para substituição nos templates
        const data = {
            total: stats.total,
            monthlyNew: stats.monthlyNew,
            growthRate: stats.growthRate,
            topCity: stats.topCities.length > 0 ? stats.topCities[0].cidade : '',
            cityCount: stats.topCities.length > 0 ? stats.topCities[0].count : 0,
            topCategory: stats.topCategories.length > 0 ? stats.topCategories[0].categoria : '',
            categoryCount: stats.topCategories.length > 0 ? stats.topCategories[0].count : 0,
            synced: stats.synced
        };
        
        // Gerar post sobre total de estabelecimentos
        if (stats.total > 0) {
            const template = this.getRandomTemplate(platform, 'milestone');
            posts.push({
                content: this.fillTemplate(template, data),
                type: 'milestone',
                data: { total: stats.total }
            });
        }
        
        // Gerar post sobre crescimento mensal
        if (stats.monthlyNew > 0) {
            const template = this.getRandomTemplate(platform, 'growth');
            posts.push({
                content: this.fillTemplate(template, data),
                type: 'growth',
                data: { monthlyNew: stats.monthlyNew, growthRate: stats.growthRate }
            });
        }
        
        // Gerar post sobre cidade com mais estabelecimentos
        if (stats.topCities.length > 0) {
            const template = this.getRandomTemplate(platform, 'city');
            posts.push({
                content: this.fillTemplate(template, data),
                type: 'city',
                data: { 
                    topCity: data.topCity, 
                    cityCount: data.cityCount 
                }
            });
        }
        
        // Gerar post sobre categoria mais popular
        if (stats.topCategories.length > 0) {
            const template = this.getRandomTemplate(platform, 'category');
            posts.push({
                content: this.fillTemplate(template, data),
                type: 'category',
                data: { 
                    topCategory: data.topCategory, 
                    categoryCount: data.categoryCount 
                }
            });
        }
        
        // Gerar post sobre estabelecimentos sincronizados
        if (stats.synced > 0) {
            const template = this.getRandomTemplate(platform, 'synced');
            posts.push({
                content: this.fillTemplate(template, data),
                type: 'synced',
                data: { synced: stats.synced }
            });
        }
        
        return posts;
    }
    
    /**
     * Gera posts para todas as plataformas
     */
    generateAllPosts() {
        const platforms = ['twitter', 'facebook', 'instagram'];
        const allPosts = {};
        
        platforms.forEach(platform => {
            allPosts[platform] = this.generatePostsForPlatform(platform);
        });
        
        // Registrar data da última geração
        this.lastGeneratedDate = new Date().toISOString();
        localStorage.setItem('lastPostGeneration', this.lastGeneratedDate);
        
        // Registrar no log de auditoria
        this.logAction('Geração de Conteúdo', `Gerados ${Object.values(allPosts).flat().length} posts para redes sociais`);
        
        return allPosts;
    }
    
    /**
     * Gera posts diários automaticamente
     */
    generateDailyPosts() {
        // Verificar se já foram gerados posts hoje
        const today = new Date().toISOString().split('T')[0];
        const lastGenerated = this.lastGeneratedDate ? this.lastGeneratedDate.split('T')[0] : null;
        
        if (lastGenerated === today) {
            console.log('Posts já foram gerados hoje');
            return { alreadyGenerated: true, lastGenerated: this.lastGeneratedDate };
        }
        
        // Gerar novos posts
        const posts = this.generateAllPosts();
        
        // Salvar posts gerados
        const savedPosts = JSON.parse(localStorage.getItem('generatedPosts') || '{}');
        savedPosts[today] = posts;
        
        // Limitar a 30 dias de histórico
        const dates = Object.keys(savedPosts).sort();
        if (dates.length > 30) {
            delete savedPosts[dates[0]];
        }
        
        localStorage.setItem('generatedPosts', JSON.stringify(savedPosts));
        
        return { 
            generated: true, 
            date: today,
            posts: posts
        };
    }
    
    /**
     * Obtém posts gerados anteriormente
     */
    getSavedPosts() {
        return JSON.parse(localStorage.getItem('generatedPosts') || '{}');
    }
    
    /**
     * Registra ação no log de auditoria
     */
    logAction(tipo, descricao) {
        // Obter log atual
        let auditLog = JSON.parse(localStorage.getItem('auditLog') || '[]');
        
        // Adicionar nova entrada
        auditLog.push({
            data: new Date().toISOString(),
            tipo: tipo,
            descricao: descricao,
            usuario: 'Sistema'
        });
        
        // Limitar tamanho do log (manter últimos 1000 registros)
        if (auditLog.length > 1000) {
            auditLog = auditLog.slice(-1000);
        }
        
        // Salvar no localStorage
        localStorage.setItem('auditLog', JSON.stringify(auditLog));
    }
}

// Exportar a classe para uso global
window.SocialMediaGenerator = SocialMediaGenerator;

// Iniciar geração automática diária quando a página for carregada
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já existe uma instância do gerador
    if (!window.socialMediaGeneratorInstance) {
        window.socialMediaGeneratorInstance = new SocialMediaGenerator();
        
        // Gerar posts diários
        window.socialMediaGeneratorInstance.generateDailyPosts();
        
        // Configurar geração automática a cada 24 horas
        setInterval(() => {
            window.socialMediaGeneratorInstance.generateDailyPosts();
        }, 24 * 60 * 60 * 1000); // 24 horas
    }
});
