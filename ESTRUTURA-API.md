# Estrutura da Nova API - Projeto "Aqui aceita Bitcoin?"

Este documento apresenta a estrutura proposta para a nova API exclusiva do projeto "Aqui aceita Bitcoin?", considerando o trabalho já iniciado e as necessidades identificadas para automação do processo de cadastro e sincronização com o OpenStreetMap/BTC Maps.

## 1. Visão Geral da Arquitetura

A API será desenvolvida seguindo uma arquitetura RESTful moderna, utilizando Node.js com Express.js para o backend e MongoDB para o banco de dados. A estrutura será organizada em camadas para facilitar a manutenção e escalabilidade.

```
┌─────────────────────────────────────────────────────────────┐
│                      Cliente (Frontend)                     │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                      │
│  (Autenticação, Rate Limiting, Logging, CORS, Compressão)   │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      Controller Layer                       │
│    (Validação de Entrada, Roteamento, Resposta HTTP)        │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                          │
│    (Lógica de Negócio, Orquestração, Transações)            │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      Repository Layer                       │
│    (Acesso a Dados, Queries, Mapeamento de Entidades)       │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                         │
│    (MongoDB, Índices, Schemas, Validação)                   │
└─────────────────────────────────────────────────────────────┘
```

## 2. Estrutura de Diretórios

```
aqui-aceita-bitcoin-api/
├── .github/                      # Configurações do GitHub (CI/CD, templates)
├── src/                          # Código fonte da aplicação
│   ├── config/                   # Configurações da aplicação
│   │   ├── database.js           # Configuração do MongoDB
│   │   ├── environment.js        # Variáveis de ambiente
│   │   ├── logger.js             # Configuração de logs
│   │   └── swagger.js            # Configuração da documentação Swagger
│   ├── controllers/              # Controladores da API
│   │   ├── auth.controller.js    # Controlador de autenticação
│   │   ├── establishment.controller.js  # Controlador de estabelecimentos
│   │   ├── sync.controller.js    # Controlador de sincronização
│   │   ├── stats.controller.js   # Controlador de estatísticas
│   │   └── social.controller.js  # Controlador de conteúdo para redes sociais
│   ├── middlewares/              # Middlewares da aplicação
│   │   ├── auth.middleware.js    # Middleware de autenticação
│   │   ├── error.middleware.js   # Middleware de tratamento de erros
│   │   ├── validation.middleware.js  # Middleware de validação de dados
│   │   └── logger.middleware.js  # Middleware de logging
│   ├── models/                   # Modelos de dados (Schemas do MongoDB)
│   │   ├── user.model.js         # Modelo de usuário
│   │   ├── establishment.model.js  # Modelo de estabelecimento
│   │   ├── sync.model.js         # Modelo de sincronização
│   │   ├── audit.model.js        # Modelo de auditoria
│   │   └── social.model.js       # Modelo de conteúdo para redes sociais
│   ├── repositories/             # Camada de acesso a dados
│   │   ├── user.repository.js    # Repositório de usuários
│   │   ├── establishment.repository.js  # Repositório de estabelecimentos
│   │   ├── sync.repository.js    # Repositório de sincronização
│   │   ├── audit.repository.js   # Repositório de auditoria
│   │   └── social.repository.js  # Repositório de conteúdo para redes sociais
│   ├── services/                 # Serviços da aplicação
│   │   ├── auth.service.js       # Serviço de autenticação
│   │   ├── establishment.service.js  # Serviço de estabelecimentos
│   │   ├── sync.service.js       # Serviço de sincronização
│   │   ├── stats.service.js      # Serviço de estatísticas
│   │   ├── social.service.js     # Serviço de conteúdo para redes sociais
│   │   └── osm.service.js        # Serviço de integração com OpenStreetMap
│   ├── utils/                    # Utilitários
│   │   ├── crypto.js             # Funções de criptografia
│   │   ├── validators.js         # Validadores de dados
│   │   ├── formatters.js         # Formatadores de dados
│   │   └── helpers.js            # Funções auxiliares
│   ├── routes/                   # Rotas da API
│   │   ├── auth.routes.js        # Rotas de autenticação
│   │   ├── establishment.routes.js  # Rotas de estabelecimentos
│   │   ├── sync.routes.js        # Rotas de sincronização
│   │   ├── stats.routes.js       # Rotas de estatísticas
│   │   └── social.routes.js      # Rotas de conteúdo para redes sociais
│   ├── jobs/                     # Tarefas agendadas
│   │   ├── sync.job.js           # Tarefa de sincronização periódica
│   │   └── social.job.js         # Tarefa de geração de conteúdo
│   ├── app.js                    # Configuração do Express
│   └── server.js                 # Ponto de entrada da aplicação
├── tests/                        # Testes automatizados
│   ├── unit/                     # Testes unitários
│   ├── integration/              # Testes de integração
│   └── e2e/                      # Testes end-to-end
├── docs/                         # Documentação
│   ├── api/                      # Documentação da API (Swagger)
│   └── guides/                   # Guias de uso
├── scripts/                      # Scripts utilitários
│   ├── seed.js                   # Script para popular o banco de dados
│   └── migrate.js                # Script para migrações de dados
├── .env.example                  # Exemplo de variáveis de ambiente
├── .gitignore                    # Arquivos ignorados pelo Git
├── .eslintrc.js                  # Configuração do ESLint
├── .prettierrc                   # Configuração do Prettier
├── jest.config.js                # Configuração do Jest (testes)
├── package.json                  # Dependências e scripts
├── README.md                     # Documentação principal
└── LICENSE                       # Licença do projeto
```

## 3. Endpoints da API

### 3.1. Autenticação

```
POST   /api/auth/register         # Registrar novo usuário
POST   /api/auth/login            # Login de usuário
POST   /api/auth/refresh          # Renovar token de acesso
POST   /api/auth/logout           # Logout de usuário
GET    /api/auth/me               # Obter dados do usuário atual
PUT    /api/auth/me               # Atualizar dados do usuário atual
POST   /api/auth/password         # Alterar senha
POST   /api/auth/forgot-password  # Solicitar redefinição de senha
POST   /api/auth/reset-password   # Redefinir senha
```

### 3.2. Estabelecimentos

```
GET    /api/establishments        # Listar estabelecimentos
POST   /api/establishments        # Criar estabelecimento
GET    /api/establishments/:id    # Obter estabelecimento por ID
PUT    /api/establishments/:id    # Atualizar estabelecimento
DELETE /api/establishments/:id    # Excluir estabelecimento
GET    /api/establishments/search # Buscar estabelecimentos
GET    /api/establishments/nearby # Buscar estabelecimentos próximos
```

### 3.3. Sincronização

```
GET    /api/sync                  # Obter status de sincronização
POST   /api/sync                  # Iniciar sincronização manual
GET    /api/sync/history          # Obter histórico de sincronização
GET    /api/sync/pending          # Listar estabelecimentos pendentes
POST   /api/sync/verify/:id       # Verificar sincronização de estabelecimento
POST   /api/sync/settings         # Atualizar configurações de sincronização
```

### 3.4. Estatísticas

```
GET    /api/stats/overview        # Obter visão geral das estatísticas
GET    /api/stats/growth          # Obter dados de crescimento
GET    /api/stats/distribution    # Obter distribuição geográfica
GET    /api/stats/categories      # Obter distribuição por categorias
GET    /api/stats/export          # Exportar estatísticas (CSV/JSON)
```

### 3.5. Conteúdo para Redes Sociais

```
GET    /api/social                # Listar conteúdo gerado
POST   /api/social/generate       # Gerar novo conteúdo
GET    /api/social/:id            # Obter conteúdo por ID
PUT    /api/social/:id            # Atualizar conteúdo
DELETE /api/social/:id            # Excluir conteúdo
GET    /api/social/templates      # Listar templates disponíveis
POST   /api/social/templates      # Criar novo template
```

### 3.6. Auditoria

```
GET    /api/audit                 # Listar registros de auditoria
GET    /api/audit/:id             # Obter registro de auditoria por ID
GET    /api/audit/filter          # Filtrar registros de auditoria
GET    /api/audit/export          # Exportar registros de auditoria
```

## 4. Modelos de Dados

### 4.1. Usuário (User)

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String,
  role: String,  // admin, editor, viewer
  active: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 4.2. Estabelecimento (Establishment)

```javascript
{
  _id: ObjectId,
  name: String,
  category: String,
  description: String,
  address: {
    street: String,
    number: String,
    complement: String,
    neighborhood: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    coordinates: {
      type: "Point",
      coordinates: [Number, Number]  // [longitude, latitude]
    }
  },
  contact: {
    phone: String,
    email: String,
    website: String,
    socialMedia: {
      instagram: String,
      twitter: String,
      facebook: String
    }
  },
  paymentMethods: {
    lightning: Boolean,
    onchain: Boolean
  },
  status: String,  // pending, synced, verified
  osmId: String,  // ID no OpenStreetMap (quando sincronizado)
  btcMapId: String,  // ID no BTC Maps (quando sincronizado)
  photos: [String],  // URLs das fotos
  createdBy: ObjectId,  // Referência ao usuário que criou
  createdAt: Date,
  updatedAt: Date
}
```

### 4.3. Sincronização (Sync)

```javascript
{
  _id: ObjectId,
  establishmentId: ObjectId,  // Referência ao estabelecimento
  status: String,  // pending, in_progress, success, failed
  source: String,  // osm, btcmap
  sourceId: String,  // ID no sistema de origem
  syncedAt: Date,
  error: String,  // Mensagem de erro (se houver)
  details: Object,  // Detalhes adicionais
  createdBy: ObjectId,  // Referência ao usuário que iniciou
  createdAt: Date,
  updatedAt: Date
}
```

### 4.4. Auditoria (Audit)

```javascript
{
  _id: ObjectId,
  action: String,  // create, update, delete, sync
  entityType: String,  // establishment, user, sync
  entityId: ObjectId,  // ID da entidade
  before: Object,  // Estado antes da ação
  after: Object,  // Estado após a ação
  userId: ObjectId,  // Usuário que realizou a ação
  ip: String,  // Endereço IP
  userAgent: String,  // User-Agent do navegador
  createdAt: Date
}
```

### 4.5. Conteúdo para Redes Sociais (Social)

```javascript
{
  _id: ObjectId,
  type: String,  // twitter, facebook, instagram
  content: String,  // Texto do post
  imageUrl: String,  // URL da imagem (se houver)
  data: Object,  // Dados utilizados para gerar o conteúdo
  status: String,  // draft, published, scheduled
  publishDate: Date,  // Data de publicação (se agendado)
  templateId: ObjectId,  // Referência ao template utilizado
  createdBy: ObjectId,  // Referência ao usuário que criou
  createdAt: Date,
  updatedAt: Date
}
```

### 4.6. Template de Conteúdo (Template)

```javascript
{
  _id: ObjectId,
  name: String,
  type: String,  // twitter, facebook, instagram
  content: String,  // Template com placeholders
  variables: [String],  // Lista de variáveis utilizadas
  active: Boolean,
  createdBy: ObjectId,  // Referência ao usuário que criou
  createdAt: Date,
  updatedAt: Date
}
```

## 5. Autenticação e Autorização

A API utilizará JWT (JSON Web Tokens) para autenticação, com tokens de acesso de curta duração e tokens de atualização de longa duração. O fluxo de autenticação será:

1. Usuário faz login com email e senha
2. API valida as credenciais e retorna um token de acesso e um token de atualização
3. Cliente utiliza o token de acesso para acessar endpoints protegidos
4. Quando o token de acesso expira, cliente utiliza o token de atualização para obter um novo token de acesso
5. Se o token de atualização expirar, usuário precisa fazer login novamente

Para autorização, a API utilizará um sistema baseado em funções (RBAC - Role-Based Access Control) com três níveis:
- **Admin**: Acesso completo a todas as funcionalidades
- **Editor**: Pode criar, editar e sincronizar estabelecimentos, mas não pode gerenciar usuários
- **Viewer**: Pode apenas visualizar dados, sem permissão para modificações

## 6. Integração com OpenStreetMap/BTC Maps

A integração com o OpenStreetMap e BTC Maps será implementada através de um serviço dedicado (`osm.service.js`) que encapsulará toda a lógica de comunicação com essas plataformas.

### 6.1. Autenticação com OpenStreetMap

A API suportará dois métodos de autenticação com o OpenStreetMap:

1. **OAuth 1.0a**: Para autenticação do usuário final
2. **API Key**: Para operações automatizadas

### 6.2. Fluxo de Sincronização

O fluxo de sincronização será:

1. Estabelecimento é marcado como pendente de sincronização
2. Serviço de sincronização verifica se o estabelecimento já existe no OpenStreetMap
3. Se não existir, cria um novo nó no OpenStreetMap com as tags apropriadas
4. Se existir, atualiza as tags do nó existente
5. Registra o ID do OpenStreetMap no estabelecimento
6. Atualiza o status do estabelecimento para "sincronizado"
7. Registra a sincronização no histórico

### 6.3. Tags do OpenStreetMap

As tags utilizadas para identificar estabelecimentos que aceitam Bitcoin serão:

```
currency:XBT=yes
payment:lightning=yes|no
payment:onchain=yes|no
check_date:currency:XBT=YYYY-MM-DD
```

## 7. Serviço de Geração de Conteúdo

O serviço de geração de conteúdo para redes sociais (`social.service.js`) será responsável por criar automaticamente posts baseados nos dados dos estabelecimentos cadastrados.

### 7.1. Tipos de Conteúdo

O serviço suportará a geração de diferentes tipos de conteúdo:

1. **Novos Estabelecimentos**: Posts sobre estabelecimentos recém-cadastrados
2. **Marcos Alcançados**: Posts sobre marcos importantes (ex: 50 estabelecimentos)
3. **Distribuição Geográfica**: Posts sobre a expansão para novas cidades/regiões
4. **Tendências de Crescimento**: Posts sobre o crescimento do projeto

### 7.2. Templates

O sistema utilizará templates com placeholders que serão substituídos por dados reais. Exemplo:

```
Temos um novo estabelecimento que aceita #Bitcoin! 🎉
O {{name}} em {{city}} agora aceita pagamentos em #BTC.
{{#if lightning}}Aceita Lightning Network para pagamentos instantâneos! ⚡{{/if}}
{{#if onchain}}Aceita pagamentos on-chain para maior segurança! 🔒{{/if}}
Visite e apoie o comércio local que adota tecnologias inovadoras! #AquiAceitaBitcoin
```

### 7.3. Agendamento

O serviço incluirá um sistema de agendamento para publicação automática de posts em horários estratégicos, utilizando uma tarefa agendada (`social.job.js`).

## 8. Requisitos Técnicos

### 8.1. Dependências Principais

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "jsonwebtoken": "^9.0.1",
    "bcrypt": "^5.1.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^6.9.0",
    "joi": "^17.9.2",
    "winston": "^3.10.0",
    "morgan": "^1.10.0",
    "node-fetch": "^3.3.2",
    "oauth": "^0.10.0",
    "node-schedule": "^2.1.1",
    "multer": "^1.4.5-lts.1",
    "swagger-ui-express": "^5.0.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "jest": "^29.6.2",
    "supertest": "^6.3.3",
    "nodemon": "^3.0.1",
    "eslint": "^8.47.0",
    "prettier": "^3.0.2",
    "husky": "^8.0.3",
    "lint-staged": "^14.0.0"
  }
}
```

### 8.2. Requisitos de Ambiente

- Node.js 18.x ou superior
- MongoDB 6.0 ou superior
- Variáveis de ambiente configuradas (ver `.env.example`)

### 8.3. Configuração de Desenvolvimento

```javascript
// .env.example
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/aqui-aceita-bitcoin
JWT_SECRET=your_jwt_secret
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
OSM_CONSUMER_KEY=your_osm_consumer_key
OSM_CONSUMER_SECRET=your_osm_consumer_secret
BTCMAP_API_URL=https://api.btcmap.org/v2/rpc
BTCMAP_API_KEY=your_btcmap_api_key
```

## 9. Implementação e Próximos Passos

### 9.1. Fase 1: Estrutura Básica e Autenticação

1. Configurar estrutura do projeto
2. Implementar conexão com MongoDB
3. Criar modelos de dados básicos
4. Implementar sistema de autenticação
5. Configurar middlewares essenciais

### 9.2. Fase 2: Gerenciamento de Estabelecimentos

1. Implementar CRUD de estabelecimentos
2. Adicionar validação de dados
3. Implementar busca e filtros
4. Adicionar suporte para upload de imagens
5. Implementar sistema de auditoria

### 9.3. Fase 3: Integração com OpenStreetMap/BTC Maps

1. Implementar serviço de comunicação com OpenStreetMap
2. Criar fluxo de sincronização
3. Implementar verificação de status
4. Adicionar histórico de sincronização
5. Implementar tratamento de erros

### 9.4. Fase 4: Geração de Conteúdo e Estatísticas

1. Implementar sistema de templates
2. Criar serviço de geração de conteúdo
3. Adicionar agendamento de posts
4. Implementar estatísticas e relatórios
5. Adicionar exportação de dados

### 9.5. Fase 5: Documentação e Testes

1. Configurar Swagger para documentação da API
2. Escrever testes unitários
3. Implementar testes de integração
4. Adicionar testes end-to-end
5. Criar documentação de uso

## 10. Considerações de Segurança

1. **Proteção contra Injeção**: Validação rigorosa de todas as entradas de usuário
2. **Autenticação Segura**: Senhas hasheadas, tokens JWT com expiração curta
3. **Autorização Adequada**: Verificação de permissões em todos os endpoints
4. **Proteção contra Ataques Comuns**: Implementação de helmet, rate limiting, CORS configurado
5. **Logs de Segurança**: Registro de todas as ações sensíveis
6. **Armazenamento Seguro de Credenciais**: Variáveis de ambiente, sem hardcoding de segredos
7. **Validação de Dados**: Esquemas Joi para validação de todas as entradas

## 11. Conclusão

Esta estrutura proposta para a API exclusiva do projeto "Aqui aceita Bitcoin?" representa um ponto de partida sólido para o desenvolvimento de uma solução robusta e escalável. Aproveitando o trabalho já iniciado e incorporando as lições aprendidas, esta API permitirá automatizar completamente o processo de cadastro e sincronização com o OpenStreetMap/BTC Maps, além de fornecer funcionalidades avançadas como geração automática de conteúdo para redes sociais e análise estatística.

A arquitetura em camadas, a estrutura de diretórios organizada e a definição clara de modelos de dados e endpoints facilitarão o desenvolvimento colaborativo e a manutenção do código a longo prazo. Com esta base, o projeto estará bem posicionado para crescer e evoluir de acordo com as necessidades futuras do Clube BR⚡LN.

---

Preparado por: Manus
Data: 24 de abril de 2025
