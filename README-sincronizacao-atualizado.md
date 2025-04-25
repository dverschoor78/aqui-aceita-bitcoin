# Sincronização com OpenStreetMap - Documentação

Este documento descreve o sistema de sincronização com o OpenStreetMap implementado no projeto "Aqui aceita Bitcoin?". O sistema permite que estabelecimentos aprovados sejam automaticamente enviados para o OpenStreetMap através da API do BTC Map.

## Índice

1. [Visão Geral](#visão-geral)
2. [Requisitos](#requisitos)
3. [Configuração](#configuração)
4. [Uso da Interface de Administração](#uso-da-interface-de-administração)
5. [Fluxo de Sincronização](#fluxo-de-sincronização)
6. [Solução de Problemas](#solução-de-problemas)
7. [Perguntas Frequentes](#perguntas-frequentes)

## Visão Geral

O sistema de sincronização com o OpenStreetMap permite que estabelecimentos aprovados no painel de administração sejam automaticamente enviados para o OpenStreetMap, tornando-os visíveis no mapa global. O sistema utiliza a API do BTC Map como intermediário para fazer as edições no OpenStreetMap.

### Componentes Principais

1. **API de Integração** (Python/Flask): Fornece endpoints para comunicação com a API do BTC Map.
2. **Cliente BTC Map** (Python): Responsável pela comunicação direta com a API do BTC Map.
3. **Serviço de Sincronização** (JavaScript): Gerencia o processo de sincronização no frontend.
4. **Interface de Administração** (HTML/JavaScript): Permite controlar o processo de sincronização.

## Requisitos

Para utilizar o sistema de sincronização, você precisa:

1. **Python 3.6 ou superior** instalado no seu computador
2. **API de Integração** em execução localmente
3. **Chave de API do BTC Map** configurada
4. **Conta no OpenStreetMap** (a autenticação é gerenciada pela API do BTC Map)

## Configuração

### 1. Configuração da API de Integração

A API de integração precisa ser configurada corretamente para se comunicar com o BTC Map. Siga estes passos:

1. Navegue até o diretório da API:
   ```
   cd /caminho/para/aqui-aceita-bitcoin-marco10/api/btcmap
   ```

2. Edite o arquivo `config.py` e configure os seguintes parâmetros:
   ```python
   # URL da API do BTC Map
   BTCMAP_API_URL = "https://api.btcmap.org/v2/rpc"
   
   # Chave de API do BTC Map (substitua por uma chave válida)
   BTCMAP_API_KEY = "sua_chave_api_aqui"
   
   # Configurações da API de integração
   API_HOST = "0.0.0.0"
   API_PORT = 5000
   API_DEBUG = True
   
   # Origens permitidas para CORS
   ALLOWED_ORIGINS = ["*"]
   ```

3. Obtenha uma chave de API do BTC Map:
   - Acesse o site do BTC Map (https://btcmap.org)
   - Crie uma conta ou faça login
   - Navegue até as configurações da API
   - Gere uma nova chave de API
   - Copie a chave e cole no arquivo `config.py`

### 2. Execução da API de Integração

A API de integração precisa estar em execução para que a sincronização funcione. Você pode executá-la de duas maneiras:

#### No Windows:

1. Navegue até o diretório da API:
   ```
   cd C:\caminho\para\aqui-aceita-bitcoin-marco10\api\btcmap
   ```

2. Execute o script batch:
   ```
   iniciar_api.bat
   ```

   Ou, se você estiver usando Python 3.13:
   ```
   iniciar_api_python313.bat
   ```

#### No Linux/Mac:

1. Navegue até o diretório da API:
   ```
   cd /caminho/para/aqui-aceita-bitcoin-marco10/api/btcmap
   ```

2. Execute o comando:
   ```
   python3 -m flask --app integration_api run --host=0.0.0.0 --port=5000
   ```

### 3. Verificação da API

Para verificar se a API está em execução corretamente:

1. Abra um navegador
2. Acesse: `http://localhost:5000/health`
3. Você deve ver uma resposta JSON como:
   ```json
   {
     "status": "ok",
     "message": "API de integração com BTC Map está funcionando",
     "client_available": true,
     "api_url": "https://api.btcmap.org/v2/rpc",
     "api_key_configured": true
   }
   ```

## Uso da Interface de Administração

A interface de administração fornece controles para gerenciar a sincronização com o OpenStreetMap.

### Acessando a Interface de Administração

1. Abra o arquivo `admin.html` no seu navegador
2. Navegue até a aba "Sincronização OSM"

### Funcionalidades Disponíveis

1. **Sincronizar Agora**: Inicia manualmente o processo de sincronização
2. **Tentar Novamente**: Tenta sincronizar novamente estabelecimentos que falharam
3. **Configurar**: Abre o modal de configuração de sincronização automática
4. **Logs de Sincronização**: Exibe logs detalhados do processo de sincronização
5. **Estatísticas**: Mostra o número de estabelecimentos processados, com sucesso e falhas

### Configuração de Sincronização Automática

Você pode configurar a sincronização para ocorrer automaticamente em intervalos regulares:

1. Clique no botão "Configurar"
2. Marque a opção "Ativar sincronização automática"
3. Defina o intervalo em minutos (mínimo 5, máximo 1440)
4. Clique em "Salvar"

## Fluxo de Sincronização

O processo de sincronização segue estes passos:

1. **Verificação da API**: O sistema verifica se a API de integração está disponível
2. **Obtenção de Estabelecimentos**: O sistema obtém a lista de estabelecimentos aprovados que precisam ser sincronizados
3. **Processamento**: Cada estabelecimento é processado sequencialmente
   - Novos estabelecimentos são adicionados ao OpenStreetMap
   - Estabelecimentos existentes são atualizados
4. **Atualização de Status**: O status de cada estabelecimento é atualizado após a sincronização
5. **Registro de Logs**: Logs detalhados são registrados durante todo o processo

## Solução de Problemas

### API não está respondendo

**Problema**: Erro "API não disponível" ou "API não está respondendo corretamente: 404"

**Solução**:
1. Verifique se a API está em execução
2. Certifique-se de que a porta 5000 não está sendo usada por outro aplicativo
3. Verifique se o firewall não está bloqueando a porta 5000
4. Reinicie a API usando o script batch ou o comando Flask

### Erro de autenticação com o BTC Map

**Problema**: Erro "Chave de API do BTC Map não configurada" ou erros de autenticação

**Solução**:
1. Verifique se a chave de API está configurada corretamente no arquivo `config.py`
2. Certifique-se de que a chave de API é válida e não expirou
3. Verifique se a URL da API do BTC Map está correta

### Problemas de CORS

**Problema**: Erros relacionados a CORS no console do navegador

**Solução**:
1. Verifique se a configuração CORS na API está correta
2. Tente acessar o arquivo `admin.html` localmente em vez de através de um servidor web
3. Instale uma extensão CORS no navegador para contornar restrições durante o desenvolvimento

### Estabelecimentos não aparecem no OpenStreetMap

**Problema**: Estabelecimentos são sincronizados com sucesso, mas não aparecem no OpenStreetMap

**Solução**:
1. Lembre-se que o OpenStreetMap pode levar algum tempo para atualizar os dados (geralmente algumas horas)
2. Verifique se as coordenadas (latitude e longitude) estão corretas
3. Certifique-se de que as tags obrigatórias estão sendo enviadas corretamente

## Perguntas Frequentes

### É necessário estar logado no OpenStreetMap para fazer edições?

Sim, é necessário ter uma conta no OpenStreetMap para fazer edições. No entanto, a autenticação é gerenciada pela API do BTC Map, então você não precisa se preocupar com isso diretamente. Basta configurar a chave de API do BTC Map corretamente.

### Como posso verificar se um estabelecimento foi sincronizado com sucesso?

Você pode verificar de duas maneiras:
1. Nos logs de sincronização na interface de administração
2. Verificando se o estabelecimento tem um `osm_id` atribuído na lista de estabelecimentos aprovados

### Posso sincronizar estabelecimentos manualmente?

Sim, você pode sincronizar estabelecimentos manualmente clicando no botão "Sincronizar Agora" na aba "Sincronização OSM" do painel de administração.

### O que acontece se a sincronização falhar?

Se a sincronização falhar, o sistema registrará o erro nos logs e marcará o estabelecimento como falha. Você pode tentar sincronizar novamente clicando no botão "Tentar Novamente".

### Como posso contribuir para melhorar o sistema de sincronização?

Você pode contribuir de várias maneiras:
1. Reportando bugs e problemas
2. Sugerindo melhorias e novas funcionalidades
3. Contribuindo com código através de pull requests no repositório do projeto

---

Para mais informações sobre o projeto "Aqui aceita Bitcoin?", visite o [repositório do projeto](https://github.com/clube-brln/aqui-aceita-bitcoin) ou entre em contato com a equipe de desenvolvimento.
