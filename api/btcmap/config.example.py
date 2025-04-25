"""
Arquivo de configuração para a API de integração com BTC Map.
ATENÇÃO: Este arquivo contém configurações sensíveis.
Para uso em produção, substitua os valores de exemplo por valores reais.
"""

# Configurações da API do BTC Map
BTCMAP_API_URL = "https://api.btcmap.org/v2/rpc"

# Chave de API do BTC Map (substitua por sua chave real)
BTCMAP_API_KEY = "YOUR_API_KEY_HERE"

# Configurações da API de integração
API_HOST = "0.0.0.0"
API_PORT = 5000
API_DEBUG = False  # Defina como False em produção

# Configurações de logging
LOG_LEVEL = "INFO"
LOG_FILE = "btcmap_integration.log"

# Configurações de segurança
ALLOWED_ORIGINS = [
    "http://localhost:8000",
    "http://localhost:8001",
    "http://localhost:8002",
    "https://aquiaceitabitcoin.com.br"
]

# Configurações do OpenStreetMap
OSM_API_URL = "https://api.openstreetmap.org/api/0.6"
OVERPASS_API_URL = "https://overpass-api.de/api/interpreter"

# Configurações de cache
CACHE_ENABLED = True
CACHE_TIMEOUT = 3600  # 1 hora em segundos
