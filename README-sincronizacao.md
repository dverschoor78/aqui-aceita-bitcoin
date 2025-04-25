# Documentação do Sistema de Sincronização com OpenStreetMap

Este documento descreve o sistema de sincronização com o OpenStreetMap implementado no projeto "Aqui aceita Bitcoin?".

## Visão Geral

O sistema de sincronização permite que os estabelecimentos aprovados no painel de administração sejam automaticamente enviados para o OpenStreetMap (OSM), garantindo que os dados estejam disponíveis globalmente e possam ser acessados por outros aplicativos e serviços.

## Componentes do Sistema

### 1. Serviço de Sincronização (`sincronizacao-osm-service.js`)

Este serviço JavaScript gerencia a comunicação entre o frontend e a API de integração com o OpenStreetMap. Suas principais funcionalidades incluem:

- Verificação da disponibilidade da API
- Inicialização de sincronização manual
- Processamento de estabelecimentos para sincronização
- Adição e atualização de estabelecimentos no OSM
- Rastreamento do status de sincronização
- Sistema de logs para monitoramento

### 2. API de Integração (`integration_api.py`)

Uma API Flask que serve como intermediária entre o frontend e a API do OpenStreetMap. Ela fornece endpoints para:

- Adicionar novos estabelecimentos ao OSM
- Atualizar estabelecimentos existentes no OSM
- Buscar estabelecimentos do OSM

### 3. Cliente BTC Map (`btcmap_client.py`)

Um cliente Python que se comunica diretamente com a API do BTC Map para realizar operações no OpenStreetMap. Ele implementa:

- Adição de estabelecimentos ao OSM
- Atualização de estabelecimentos no OSM
- Busca de estabelecimentos no OSM

### 4. Interface de Administração (`sincronizacao-admin.js`)

Script que implementa a interface de usuário para controle da sincronização na página de administração. Ele permite:

- Iniciar sincronizações manuais
- Tentar novamente sincronizações que falharam
- Configurar sincronização automática
- Visualizar logs e resultados da sincronização

### 5. Sistema de Notificações (`notificacao-manager.js`)

Gerencia as notificações do sistema, incluindo alertas sobre resultados de sincronização.

## Fluxo de Sincronização

1. **Aprovação de Estabelecimento**: Quando um estabelecimento é aprovado no painel de administração, ele é marcado para sincronização.

2. **Inicialização da Sincronização**: A sincronização pode ser iniciada manualmente clicando no botão "Sincronizar Agora" ou automaticamente se a sincronização automática estiver configurada.

3. **Verificação da API**: O sistema verifica se a API de integração está disponível.

4. **Processamento de Estabelecimentos**: O sistema obtém a lista de estabelecimentos aprovados que precisam ser sincronizados.

5. **Envio para o OSM**: Cada estabelecimento é enviado para o OpenStreetMap através da API de integração.

6. **Atualização de Status**: O status de cada estabelecimento é atualizado após a sincronização.

7. **Notificação de Resultados**: O sistema notifica o usuário sobre os resultados da sincronização.

## Como Usar

### Sincronização Manual

1. Acesse o painel de administração em `/admin.html`
2. Navegue até a aba "Sincronização OSM"
3. Clique no botão "Sincronizar Agora"
4. Acompanhe o progresso e os resultados na mesma tela

### Configuração de Sincronização Automática

1. Na aba "Sincronização OSM", clique no botão "Configurar"
2. Marque a opção "Ativar sincronização automática"
3. Defina o intervalo de sincronização em minutos
4. Clique em "Salvar Configurações"

### Tentativa de Sincronização de Falhas

Se algum estabelecimento falhar durante a sincronização:

1. Aguarde a conclusão da sincronização atual
2. Clique no botão "Tentar Novamente" para tentar sincronizar apenas os estabelecimentos que falharam

## Logs e Monitoramento

O sistema mantém logs detalhados de todas as operações de sincronização. Esses logs podem ser visualizados:

1. Na aba "Sincronização OSM", na seção "Log de Sincronização"
2. Na aba "Logs do Sistema", que mostra todos os logs do sistema, incluindo os de sincronização

## Solução de Problemas

### A sincronização não inicia

- Verifique se a API de integração está em execução
- Verifique se as credenciais da API estão configuradas corretamente em `config.py`

### Falhas na sincronização

- Verifique os logs para identificar o problema específico
- Certifique-se de que os dados do estabelecimento estão completos e válidos
- Verifique se a API do BTC Map está acessível

### Estabelecimentos não aparecem no OSM

- A sincronização com o OSM pode levar algum tempo para ser processada
- Verifique se o estabelecimento foi sincronizado com sucesso nos logs
- Certifique-se de que as coordenadas do estabelecimento estão corretas

## Configuração Técnica

### Arquivo `config.py`

Este arquivo contém as configurações necessárias para a API de integração:

```python
# URL da API do BTC Map
BTCMAP_API_URL = "https://api.btcmap.org/v2/rpc"

# Chave de API do BTC Map
BTCMAP_API_KEY = "sua_chave_api_aqui"

# Configurações da API de integração
API_HOST = "0.0.0.0"
API_PORT = 5000
API_DEBUG = False

# Origens permitidas para CORS
ALLOWED_ORIGINS = ["*"]
```

### Inicialização da API de Integração

Para iniciar a API de integração:

```bash
cd /caminho/para/api/btcmap
python3 -m flask --app integration_api run --host=0.0.0.0 --port=5000
```

## Considerações de Segurança

- A chave de API do BTC Map deve ser mantida em segurança
- Em ambiente de produção, restrinja as origens permitidas para CORS
- Considere implementar autenticação para a API de integração

## Futuras Melhorias

- Implementação de um sistema de filas para processamento assíncrono
- Adição de mais opções de configuração para a sincronização
- Melhorias na interface de usuário para visualização de resultados
- Implementação de um sistema de alertas para falhas críticas
