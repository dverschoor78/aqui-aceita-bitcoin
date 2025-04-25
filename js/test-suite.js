/**
 * Suite de Testes - Aqui aceita Bitcoin?
 * 
 * Este arquivo contém testes automatizados para verificar
 * o funcionamento correto das funcionalidades básicas do sistema.
 */

class TestSuite {
    constructor() {
        this.tests = [];
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0
        };
        this.testLog = [];
    }
    
    /**
     * Adiciona um teste à suite
     */
    addTest(name, testFn) {
        this.tests.push({ name, testFn });
    }
    
    /**
     * Executa todos os testes
     */
    async runTests() {
        this.results = {
            total: this.tests.length,
            passed: 0,
            failed: 0,
            skipped: 0
        };
        
        this.testLog = [];
        
        console.log(`Iniciando execução de ${this.tests.length} testes...`);
        
        for (const test of this.tests) {
            try {
                console.log(`Executando teste: ${test.name}`);
                await test.testFn();
                this.results.passed++;
                this.logTest(test.name, 'PASSOU', '✅');
            } catch (error) {
                if (error.message === 'SKIP') {
                    this.results.skipped++;
                    this.logTest(test.name, 'PULADO', '⚠️', error.reason || 'Teste pulado');
                } else {
                    this.results.failed++;
                    this.logTest(test.name, 'FALHOU', '❌', error.message || error);
                }
            }
        }
        
        console.log('Testes concluídos!');
        console.log(`Total: ${this.results.total}, Passou: ${this.results.passed}, Falhou: ${this.results.failed}, Pulado: ${this.results.skipped}`);
        
        return this.results;
    }
    
    /**
     * Registra resultado de um teste
     */
    logTest(name, status, icon, message = '') {
        const logEntry = {
            name,
            status,
            icon,
            message,
            timestamp: new Date().toISOString()
        };
        
        this.testLog.push(logEntry);
        console.log(`${icon} ${name}: ${status}${message ? ' - ' + message : ''}`);
    }
    
    /**
     * Exibe resultados dos testes na interface
     */
    displayResults(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Limpar container
        container.innerHTML = '';
        
        // Criar cabeçalho de resultados
        const header = document.createElement('div');
        header.className = 'test-results-header';
        header.innerHTML = `
            <h3>Resultados dos Testes</h3>
            <div class="test-summary">
                <span class="test-total">Total: ${this.results.total}</span>
                <span class="test-passed">Passou: ${this.results.passed}</span>
                <span class="test-failed">Falhou: ${this.results.failed}</span>
                <span class="test-skipped">Pulado: ${this.results.skipped}</span>
            </div>
        `;
        container.appendChild(header);
        
        // Criar lista de resultados
        const resultsList = document.createElement('div');
        resultsList.className = 'test-results-list';
        
        this.testLog.forEach(log => {
            const resultItem = document.createElement('div');
            resultItem.className = `test-result-item test-${log.status.toLowerCase()}`;
            
            resultItem.innerHTML = `
                <div class="test-result-icon">${log.icon}</div>
                <div class="test-result-name">${log.name}</div>
                <div class="test-result-status">${log.status}</div>
                ${log.message ? `<div class="test-result-message">${log.message}</div>` : ''}
            `;
            
            resultsList.appendChild(resultItem);
        });
        
        container.appendChild(resultsList);
    }
    
    /**
     * Função auxiliar para pular um teste
     */
    skip(reason) {
        const error = new Error('SKIP');
        error.reason = reason;
        throw error;
    }
    
    /**
     * Função auxiliar para verificar uma condição
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Asserção falhou');
        }
    }
}

// Criar instância da suite de testes
const testSuite = new TestSuite();

// Adicionar testes para o sistema de armazenamento local
testSuite.addTest('Verificar localStorage disponível', function() {
    testSuite.assert(typeof localStorage !== 'undefined', 'localStorage não está disponível');
});

testSuite.addTest('Salvar e recuperar dados do localStorage', function() {
    const testKey = 'test_key';
    const testValue = { test: 'value', number: 123 };
    
    // Salvar no localStorage
    localStorage.setItem(testKey, JSON.stringify(testValue));
    
    // Recuperar do localStorage
    const retrievedValue = JSON.parse(localStorage.getItem(testKey));
    
    // Verificar se os valores são iguais
    testSuite.assert(retrievedValue.test === testValue.test, 'Valores de texto não correspondem');
    testSuite.assert(retrievedValue.number === testValue.number, 'Valores numéricos não correspondem');
    
    // Limpar
    localStorage.removeItem(testKey);
});

// Adicionar testes para o gerenciador de estatísticas
testSuite.addTest('Verificar EstatisticasManager', function() {
    if (typeof EstatisticasManager === 'undefined') {
        testSuite.skip('EstatisticasManager não está definido');
    }
    
    const manager = new EstatisticasManager();
    testSuite.assert(manager !== null, 'Não foi possível criar instância de EstatisticasManager');
    testSuite.assert(typeof manager.getGeneralStats === 'function', 'Método getGeneralStats não encontrado');
});

// Adicionar testes para o gerador de conteúdo para redes sociais
testSuite.addTest('Verificar SocialMediaGenerator', function() {
    if (typeof SocialMediaGenerator === 'undefined') {
        testSuite.skip('SocialMediaGenerator não está definido');
    }
    
    const generator = new SocialMediaGenerator();
    testSuite.assert(generator !== null, 'Não foi possível criar instância de SocialMediaGenerator');
    testSuite.assert(typeof generator.generateAllPosts === 'function', 'Método generateAllPosts não encontrado');
});

// Adicionar testes para o gerenciador de auditoria
testSuite.addTest('Verificar AuditoriaManager', function() {
    if (typeof AuditoriaManager === 'undefined') {
        testSuite.skip('AuditoriaManager não está definido');
    }
    
    const manager = new AuditoriaManager();
    testSuite.assert(manager !== null, 'Não foi possível criar instância de AuditoriaManager');
    testSuite.assert(typeof manager.registrarAcao === 'function', 'Método registrarAcao não encontrado');
});

// Adicionar testes para o cadastro de estabelecimentos
testSuite.addTest('Cadastrar estabelecimento de teste', function() {
    // Obter lista atual
    const currentList = JSON.parse(localStorage.getItem('establishments') || '[]');
    const initialCount = currentList.length;
    
    // Criar estabelecimento de teste
    const testEstablishment = {
        id: 'test_' + Date.now(),
        nome: 'Estabelecimento de Teste',
        categoria: 'Café',
        endereco: 'Rua de Teste, 123',
        cidade: 'Cidade de Teste',
        estado: 'TS',
        lightning: true,
        onchain: false,
        data_cadastro: new Date().toISOString(),
        status: 'pending'
    };
    
    // Adicionar à lista
    currentList.push(testEstablishment);
    localStorage.setItem('establishments', JSON.stringify(currentList));
    
    // Verificar se foi adicionado
    const updatedList = JSON.parse(localStorage.getItem('establishments') || '[]');
    testSuite.assert(updatedList.length === initialCount + 1, 'Estabelecimento não foi adicionado');
    
    // Verificar se o estabelecimento está na lista
    const found = updatedList.some(e => e.id === testEstablishment.id);
    testSuite.assert(found, 'Estabelecimento não encontrado na lista');
    
    // Limpar (remover estabelecimento de teste)
    const cleanedList = updatedList.filter(e => e.id !== testEstablishment.id);
    localStorage.setItem('establishments', JSON.stringify(cleanedList));
});

// Adicionar testes para o sistema de flags
testSuite.addTest('Verificar sistema de flags de status', function() {
    // Obter lista atual
    const currentList = JSON.parse(localStorage.getItem('establishments') || '[]');
    
    // Criar estabelecimentos de teste com diferentes status
    const testEstablishments = [
        {
            id: 'test_pending_' + Date.now(),
            nome: 'Estabelecimento Pendente',
            status: 'pending',
            data_cadastro: new Date().toISOString()
        },
        {
            id: 'test_synced_' + Date.now(),
            nome: 'Estabelecimento Sincronizado',
            status: 'synced',
            data_cadastro: new Date().toISOString()
        },
        {
            id: 'test_verified_' + Date.now(),
            nome: 'Estabelecimento Verificado',
            status: 'verified',
            data_cadastro: new Date().toISOString()
        }
    ];
    
    // Adicionar à lista
    const updatedList = [...currentList, ...testEstablishments];
    localStorage.setItem('establishments', JSON.stringify(updatedList));
    
    // Verificar se foram adicionados
    const retrievedList = JSON.parse(localStorage.getItem('establishments') || '[]');
    
    // Verificar se cada estabelecimento está na lista com o status correto
    testEstablishments.forEach(testEst => {
        const found = retrievedList.find(e => e.id === testEst.id);
        testSuite.assert(found, `Estabelecimento ${testEst.nome} não encontrado`);
        testSuite.assert(found.status === testEst.status, `Status incorreto para ${testEst.nome}`);
    });
    
    // Limpar (remover estabelecimentos de teste)
    const cleanedList = retrievedList.filter(e => !e.id.startsWith('test_'));
    localStorage.setItem('establishments', JSON.stringify(cleanedList));
});

// Adicionar teste para verificar a integração do mapa do BTC Maps
testSuite.addTest('Verificar integração do mapa BTC Maps', function() {
    // Este teste precisa ser executado na página que contém o mapa
    if (!document.getElementById('btc-map')) {
        testSuite.skip('Elemento do mapa não encontrado na página atual');
    }
    
    const mapContainer = document.getElementById('btc-map');
    const iframe = mapContainer.querySelector('iframe');
    
    testSuite.assert(iframe, 'iframe do mapa não encontrado');
    testSuite.assert(iframe.src.includes('btcmap.org'), 'iframe não está apontando para btcmap.org');
});

// Executar testes quando a página for carregada
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de testes
    const testContainer = document.getElementById('test-results');
    if (testContainer) {
        // Executar testes e exibir resultados
        testSuite.runTests().then(() => {
            testSuite.displayResults('test-results');
        });
    }
});
