# Documentação da Versão Local do "Aqui aceita Bitcoin?"

## Visão Geral

Este documento descreve a versão local do projeto "Aqui aceita Bitcoin?", que foi implementada para resolver os problemas de comunicação entre o frontend e a API.

## Problema

O problema principal era a política de segurança dos navegadores modernos, que bloqueia a comunicação entre um site HTTPS (como https://dejaljnp.manus.space) e uma API local HTTP (como http://localhost:5000). Isso resultava em erros "Failed to fetch" no frontend, mesmo quando a API estava funcionando corretamente.

## Solução: Versão Local Completa

A solução implementada é uma versão completamente local do projeto, onde tanto o frontend quanto a API são executados localmente, evitando problemas de comunicação entre diferentes origens e protocolos.

### Componentes da Solução

1. **API Local**:
   - Implementada com Flask em Python
   - Executa localmente em http://localhost:5000
   - Gerencia a comunicação com o OpenStreetMap

2. **Frontend Local**:
   - Arquivos HTML, CSS e JavaScript executados diretamente do sistema de arquivos local
   - Comunicação direta com a API local sem restrições de segurança
   - Serviço de sincronização otimizado para uso local

## Configuração e Uso

### Configuração da API Local

1. **Extrair o Pacote**:
   Extraia o pacote `aqui-aceita-bitcoin-marco32.tar.gz` para uma pasta de sua preferência.

2. **Configurar a API**:
   Edite o arquivo `api/btcmap/config.py` e adicione suas credenciais do OpenStreetMap:
   ```python
   OSM_CLIENT_ID = "seu_client_id_aqui"
   OSM_CLIENT_SECRET = "seu_client_secret_aqui"
   OSM_REDIRECT_URI = "sua_uri_de_redirecionamento_aqui"
   ```

3. **Executar a API**:
   ```bash
   cd api/btcmap
   python -m flask --app integration_api run --host=0.0.0.0 --port=5000
   ```
   Ou use o script batch para Windows:
   ```
   iniciar_api_python313.bat
   ```

### Uso do Frontend Local

1. **Abrir o Frontend**:
   - Navegue até a pasta onde você extraiu o projeto
   - Clique duas vezes no arquivo `admin.html` para abri-lo no navegador
   - Isso abrirá o frontend com o protocolo `file://` em vez de `https://`

2. **Usar a Sincronização**:
   - Navegue até a aba "Sincronização OSM"
   - Clique em "Sincronizar Agora"
   - Acompanhe o progresso nos logs de sincronização

## Fluxo de Comunicação

1. O frontend local faz requisições diretamente para a API local via HTTP
2. A API local processa as requisições e se comunica com o OpenStreetMap
3. A API local retorna as respostas para o frontend
4. O frontend atualiza a interface com os resultados

## Solução de Problemas

### Verificar se a API Local está Rodando

Acesse http://localhost:5000/health no seu navegador. Você deve ver uma resposta JSON indicando que a API está funcionando.

### Logs de Sincronização

Os logs de sincronização são exibidos na aba "Sincronização OSM" do painel de administração. Eles fornecem informações detalhadas sobre o processo de sincronização e possíveis erros.

### Problemas Comuns

1. **API não está respondendo**:
   - Verifique se a API está rodando corretamente
   - Certifique-se de que a porta 5000 não está sendo usada por outro aplicativo
   - Verifique os logs da API para identificar possíveis erros

2. **Erro de autenticação com o OpenStreetMap**:
   - Verifique se as credenciais do OpenStreetMap estão configuradas corretamente
   - Certifique-se de que a aplicação tem as permissões necessárias no OpenStreetMap

3. **Estabelecimentos não aparecem no OpenStreetMap**:
   - Verifique se os estabelecimentos foram aprovados no painel de administração
   - Certifique-se de que a sincronização foi concluída com sucesso
   - Pode levar algum tempo para que as alterações apareçam no OpenStreetMap

## Considerações Finais

Esta versão local do projeto "Aqui aceita Bitcoin?" foi projetada para funcionar completamente em ambiente local, evitando os problemas de comunicação entre diferentes origens e protocolos. Embora isso signifique que você precisa executar o projeto em seu próprio computador, essa abordagem garante que a sincronização com o OpenStreetMap funcione corretamente.

Se você precisar de uma versão hospedada do projeto no futuro, será necessário implementar uma solução mais robusta para lidar com as restrições de segurança dos navegadores modernos, como um proxy HTTPS ou uma API hospedada com HTTPS.
