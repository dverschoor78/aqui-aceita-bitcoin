/**
 * Configuração para proxy HTTPS para API local
 * 
 * Este script configura um proxy HTTPS para a API local,
 * permitindo que o frontend hospedado em HTTPS se comunique
 * com a API local através de uma conexão segura.
 */

// Importar módulos necessários
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Configurações
const PORT = process.env.PORT || 3000;
const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.API_PORT || 5000;
const API_URL = `http://${API_HOST}:${API_PORT}`;

// Criar aplicação Express
const app = express();

// Configurar CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Configurar proxy para a API
const apiProxy = createProxyMiddleware({
  target: API_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '' // Remover prefixo /api
  },
  onProxyRes: (proxyRes, req, res) => {
    // Adicionar cabeçalhos CORS
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
  },
  logLevel: 'debug'
});

// Rota para verificar se o proxy está funcionando
app.get('/proxy-health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Proxy HTTPS para API local está funcionando',
    api_url: API_URL,
    timestamp: new Date().toISOString()
  });
});

// Configurar rotas para a API
app.use('/api', apiProxy);
app.use('/health', apiProxy);
app.use('/establishments', apiProxy);

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota para a página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor HTTP para desenvolvimento local
app.listen(PORT, () => {
  console.log(`Servidor proxy HTTP rodando em http://localhost:${PORT}`);
  console.log(`Redirecionando requisições para API em ${API_URL}`);
});

// Verificar se existem certificados para HTTPS
const certPath = path.join(__dirname, 'certs');
const keyFile = path.join(certPath, 'key.pem');
const certFile = path.join(certPath, 'cert.pem');

if (fs.existsSync(keyFile) && fs.existsSync(certFile)) {
  // Configurar servidor HTTPS
  const httpsOptions = {
    key: fs.readFileSync(keyFile),
    cert: fs.readFileSync(certFile)
  };
  
  // Iniciar servidor HTTPS
  https.createServer(httpsOptions, app).listen(PORT + 1, () => {
    console.log(`Servidor proxy HTTPS rodando em https://localhost:${PORT + 1}`);
    console.log(`Redirecionando requisições para API em ${API_URL}`);
  });
} else {
  console.log('Certificados HTTPS não encontrados. Apenas o servidor HTTP está rodando.');
  console.log('Para habilitar HTTPS, crie certificados em ./certs/');
}
