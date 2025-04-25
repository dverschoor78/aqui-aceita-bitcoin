# Documentação da Solução com Proxy HTTPS

## Visão Geral

Este documento descreve a solução implementada para resolver os problemas de comunicação entre o frontend hospedado (HTTPS) e a API local (HTTP) no projeto "Aqui aceita Bitcoin?".

## Problema

O problema principal era a política de segurança "Private Network Access" do navegador, que bloqueia a comunicação entre um site HTTPS (como https://dejaljnp.manus.space) e uma API local HTTP (como http://localhost:5000). Isso resultava em erros "Failed to fetch" no frontend, mesmo quando a API estava funcionando corretamente.

## Solução: Proxy HTTPS

A solução implementada utiliza um servidor proxy HTTPS que atua como intermediário entre o frontend hospedado e a API local. O proxy recebe requisições HTTPS do frontend e as encaminha para a API local via HTTP, contornando as restrições de segurança do navegador.

### Componentes da Solução

1. **Servidor Proxy HTTPS**:
   - Implementado com Node.js, Express e http-proxy-middleware
   - Recebe requisições HTTPS e as encaminha para a API local
   - Adiciona cabeçalhos CORS necessários para permitir a comunicação

2. **Frontend Configurado**:
   - Modificado para usar o proxy HTTPS em vez de tentar se conectar diretamente à API local
   - Usa a URL `https://dejaljnp.manus.space/proxy` para todas as requisições à API

## Configuração e Uso

### Configuração do Servidor Proxy

1. **Instalar Dependências**:
   ```bash
   cd proxy
   npm install
   ```

2. **Gerar Certificados SSL** (opcional para desenvolvimento local):
   ```bash
   npm run generate-certs
   ```

3. **Iniciar o Servidor Proxy**:
   ```bash
   npm start
   ```

4. **Configurar Variáveis de Ambiente** (opcional):
   - `PORT`: Porta do servidor proxy (padrão: 3000)
   - `API_HOST`: Host da API local (padrão: localhost)
   - `API_PORT`: Porta da API local (padrão: 5000)

### Uso do Frontend com Proxy

O frontend já está configurado para usar o proxy HTTPS. Não é necessária nenhuma configuração adicional para usar a versão hospedada em https://dejaljnp.manus.space.

## Fluxo de Comunicação

1. O frontend hospedado em HTTPS faz requisições para o proxy HTTPS
2. O proxy HTTPS recebe as requisições e as encaminha para a API local via HTTP
3. A API local processa as requisições e retorna as respostas para o proxy
4. O proxy encaminha as respostas para o frontend

## Implantação

### Implantação do Proxy

O proxy está implantado no mesmo servidor que hospeda o frontend, em https://dejaljnp.manus.space/proxy.

### Implantação da API Local

A API local deve ser executada no computador do usuário:

1. **Extrair o Pacote**:
   Extraia o pacote `aqui-aceita-bitcoin-marco30.tar.gz` para uma pasta de sua preferência.

2. **Configurar a API**:
   Edite o arquivo `api/btcmap/config.py` e adicione suas credenciais do OpenStreetMap.

3. **Executar a API**:
   ```bash
   cd api/btcmap
   python -m flask --app integration_api run --host=0.0.0.0 --port=5000
   ```
   Ou use o script batch para Windows:
   ```
   iniciar_api_python313.bat
   ```

## Solução de Problemas

### Verificar se a API Local está Rodando

Acesse http://localhost:5000/health no seu navegador. Você deve ver uma resposta JSON indicando que a API está funcionando.

### Verificar se o Proxy está Funcionando

Acesse https://dejaljnp.manus.space/proxy/health no seu navegador. Você deve ver a mesma resposta que obteria acessando diretamente a API local.

### Logs de Sincronização

Os logs de sincronização são exibidos na aba "Sincronização OSM" do painel de administração. Eles fornecem informações detalhadas sobre o processo de sincronização e possíveis erros.

## Considerações de Segurança

Esta solução utiliza um proxy HTTPS para contornar as restrições de segurança do navegador. Embora isso resolva o problema de comunicação, é importante observar que:

1. O proxy HTTPS tem acesso a todas as requisições e respostas entre o frontend e a API
2. As credenciais do OpenStreetMap são armazenadas localmente no arquivo `config.py`
3. A comunicação entre o proxy e a API local ainda é feita via HTTP (não criptografada)

Para ambientes de produção, recomenda-se implementar medidas adicionais de segurança, como autenticação no proxy e criptografia da comunicação entre o proxy e a API local.
