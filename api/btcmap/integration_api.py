"""
API de integração com o BTC Map para cadastro de estabelecimentos no OpenStreetMap.

Esta API fornece endpoints para cadastrar estabelecimentos que aceitam Bitcoin
no OpenStreetMap através da API do BTC Map, evitando duplicação de dados.
"""

import os
import logging
import json
from flask import Flask, request, jsonify, Response, make_response
from flask_cors import CORS
from typing import Dict, Any, Tuple, Optional

# Importar cliente BTC Map
try:
    from btcmap_client import get_client, BTCMapClient
    client_available = True
except ImportError:
    client_available = False
    logging.error("Não foi possível importar o cliente BTC Map. Alguns endpoints não funcionarão corretamente.")

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Importar configurações
try:
    from config import API_HOST, API_PORT, API_DEBUG, ALLOWED_ORIGINS, BTCMAP_API_KEY, BTCMAP_API_URL
    from config import OSM_CLIENT_ID, OSM_CLIENT_SECRET, OSM_REDIRECT_URI
except ImportError:
    logger.warning("Arquivo config.py não encontrado. Usando valores padrão.")
    API_HOST = "0.0.0.0"
    API_PORT = 5000
    API_DEBUG = True
    ALLOWED_ORIGINS = ["*"]
    BTCMAP_API_URL = "https://api.btcmap.org/v2/rpc"
    BTCMAP_API_KEY = ""
    OSM_CLIENT_ID = ""
    OSM_CLIENT_SECRET = ""
    OSM_REDIRECT_URI = ""

# Inicializar aplicação Flask
app = Flask(__name__)

# Configurar CORS para todas as rotas
CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}}, supports_credentials=True)

# Inicializar cliente BTC Map se disponível
btcmap_client = get_client(BTCMAP_API_URL, BTCMAP_API_KEY) if client_available else None
if btcmap_client:
    logger.info(f"Cliente BTC Map inicializado com URL: {BTCMAP_API_URL}")
    if BTCMAP_API_KEY:
        logger.info("Chave de API do BTC Map configurada")
    else:
        logger.warning("Chave de API do BTC Map não configurada. Algumas operações podem falhar.")
else:
    logger.warning("Cliente BTC Map não disponível")


# Função auxiliar para lidar com requisições OPTIONS
def handle_options_request():
    """Função auxiliar para lidar com requisições OPTIONS de forma consistente"""
    response = make_response()
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Allow-Private-Network', 'true')
    response.headers.add('Access-Control-Max-Age', '3600')
    return response


# Registrar middleware para log de todas as requisições
@app.before_request
def log_request_info():
    """Log de informações da requisição antes de processá-la"""
    logger.info(f"Requisição recebida: {request.method} {request.path}")
    logger.info(f"Headers: {dict(request.headers)}")
    if request.method == 'OPTIONS':
        logger.info("Requisição OPTIONS detectada")


@app.after_request
def add_cors_headers(response):
    """Adicionar cabeçalhos CORS a todas as respostas"""
    origin = request.headers.get('Origin', '*')
    response.headers.add('Access-Control-Allow-Origin', origin)
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Allow-Private-Network', 'true')
    return response


@app.route('/health', methods=['GET', 'OPTIONS'])
def health_check():
    """
    Endpoint para verificar a saúde da API.
    
    Returns:
        Resposta JSON com status da API.
    """
    if request.method == 'OPTIONS':
        return handle_options_request()
    
    logger.info("Processando requisição GET em /health")
    return jsonify({
        "status": "ok",
        "message": "API de integração com BTC Map está funcionando",
        "client_available": client_available,
        "api_url": BTCMAP_API_URL,
        "api_key_configured": bool(BTCMAP_API_KEY),
        "osm_auth_configured": bool(OSM_CLIENT_ID and OSM_CLIENT_SECRET)
    })


@app.route('/api/health', methods=['GET', 'OPTIONS'])
def api_health_check():
    """Versão compatível do endpoint de saúde com prefixo /api"""
    if request.method == 'OPTIONS':
        return handle_options_request()
    
    logger.info("Processando requisição GET em /api/health")
    return jsonify({
        "status": "ok",
        "message": "API de integração com BTC Map está funcionando",
        "client_available": client_available,
        "api_url": BTCMAP_API_URL,
        "api_key_configured": bool(BTCMAP_API_KEY),
        "osm_auth_configured": bool(OSM_CLIENT_ID and OSM_CLIENT_SECRET)
    })


@app.route('/', methods=['GET', 'OPTIONS'])
def root():
    """Endpoint raiz para informações básicas sobre a API"""
    if request.method == 'OPTIONS':
        return handle_options_request()
    
    logger.info("Processando requisição GET em /")
    return jsonify({
        "name": "API de Integração com BTC Map",
        "description": "API para cadastro de estabelecimentos no OpenStreetMap via BTC Map",
        "version": "1.0.0",
        "endpoints": [
            {"path": "/", "methods": ["GET"], "description": "Informações sobre a API"},
            {"path": "/health", "methods": ["GET"], "description": "Verificar saúde da API"},
            {"path": "/api/health", "methods": ["GET"], "description": "Verificar saúde da API (compatibilidade)"},
            {"path": "/establishments", "methods": ["POST"], "description": "Adicionar estabelecimento"},
            {"path": "/api/establishments", "methods": ["POST"], "description": "Adicionar estabelecimento (compatibilidade)"},
            {"path": "/establishments/<osm_id>", "methods": ["PUT"], "description": "Atualizar estabelecimento"},
            {"path": "/api/establishments/<osm_id>", "methods": ["PUT"], "description": "Atualizar estabelecimento (compatibilidade)"},
            {"path": "/establishments/search", "methods": ["GET"], "description": "Buscar estabelecimentos"},
            {"path": "/api/establishments/search", "methods": ["GET"], "description": "Buscar estabelecimentos (compatibilidade)"}
        ]
    })


@app.route('/establishments', methods=['POST', 'OPTIONS'])
def add_establishment():
    """
    Endpoint para adicionar um novo estabelecimento ao OpenStreetMap via BTC Map.
    
    Espera um JSON com os dados do estabelecimento no corpo da requisição.
    
    Returns:
        Resposta JSON com o resultado da operação e código de status HTTP.
    """
    if request.method == 'OPTIONS':
        return handle_options_request()
    
    if not client_available:
        return jsonify({
            "success": False,
            "error": "Cliente BTC Map não disponível"
        }), 503
    
    if not BTCMAP_API_KEY and not (OSM_CLIENT_ID and OSM_CLIENT_SECRET):
        return jsonify({
            "success": False,
            "error": "Credenciais de autenticação não configuradas (BTC Map ou OSM)"
        }), 503
    
    try:
        # Obter dados do estabelecimento do corpo da requisição
        establishment_data = request.json
        logger.info(f"Dados recebidos: {establishment_data}")
        
        # Validar dados mínimos
        required_fields = ["name", "lat", "lon"]
        for field in required_fields:
            if field not in establishment_data:
                return jsonify({
                    "success": False,
                    "error": f"Campo obrigatório ausente: {field}"
                }), 400
        
        # Adicionar estabelecimento via cliente BTC Map
        result = btcmap_client.add_establishment(establishment_data)
        
        # Retornar resultado
        return jsonify({
            "success": True,
            "message": "Estabelecimento cadastrado com sucesso",
            "data": result
        }), 201
    
    except ValueError as e:
        # Erro de validação
        logger.error(f"Erro de validação: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400
    
    except Exception as e:
        # Erro ao adicionar estabelecimento
        logger.error(f"Erro ao adicionar estabelecimento: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/establishments', methods=['POST', 'OPTIONS'])
def api_add_establishment():
    """Versão compatível do endpoint de adição com prefixo /api"""
    if request.method == 'OPTIONS':
        return handle_options_request()
    
    logger.info("Redirecionando requisição para /establishments")
    return add_establishment()


@app.route('/establishments/<osm_id>', methods=['PUT', 'OPTIONS'])
def update_establishment(osm_id):
    """
    Endpoint para atualizar um estabelecimento existente no OpenStreetMap via BTC Map.
    
    Args:
        osm_id: ID do estabelecimento no OpenStreetMap.
    
    Returns:
        Resposta JSON com o resultado da operação e código de status HTTP.
    """
    if request.method == 'OPTIONS':
        return handle_options_request()
    
    if not client_available:
        return jsonify({
            "success": False,
            "error": "Cliente BTC Map não disponível"
        }), 503
    
    if not BTCMAP_API_KEY and not (OSM_CLIENT_ID and OSM_CLIENT_SECRET):
        return jsonify({
            "success": False,
            "error": "Credenciais de autenticação não configuradas (BTC Map ou OSM)"
        }), 503
    
    try:
        # Obter dados do estabelecimento do corpo da requisição
        establishment_data = request.json
        logger.info(f"Atualizando estabelecimento {osm_id} com dados: {establishment_data}")
        
        # Atualizar estabelecimento via cliente BTC Map
        result = btcmap_client.update_establishment(osm_id, establishment_data)
        
        # Retornar resultado
        return jsonify({
            "success": True,
            "message": "Estabelecimento atualizado com sucesso",
            "data": result
        }), 200
    
    except Exception as e:
        # Erro ao atualizar estabelecimento
        logger.error(f"Erro ao atualizar estabelecimento: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/establishments/<osm_id>', methods=['PUT', 'OPTIONS'])
def api_update_establishment(osm_id):
    """Versão compatível do endpoint de atualização com prefixo /api"""
    if request.method == 'OPTIONS':
        return handle_options_request()
    
    logger.info(f"Redirecionando requisição para /establishments/{osm_id}")
    return update_establishment(osm_id)


@app.route('/establishments/search', methods=['GET', 'OPTIONS'])
def search_establishments():
    """
    Endpoint para buscar estabelecimentos que aceitam Bitcoin no OpenStreetMap via BTC Map.
    
    Parâmetros de consulta:
        south: Latitude sul dos limites da busca.
        west: Longitude oeste dos limites da busca.
        north: Latitude norte dos limites da busca.
        east: Longitude leste dos limites da busca.
        query: Termo de busca opcional.
        limit: Número máximo de resultados (padrão: 100).
    
    Returns:
        Resposta JSON com os estabelecimentos encontrados e código de status HTTP.
    """
    if request.method == 'OPTIONS':
        return handle_options_request()
    
    if not client_available:
        return jsonify({
            "success": False,
            "error": "Cliente BTC Map não disponível"
        }), 503
    
    try:
        # Obter parâmetros de consulta
        south = request.args.get('south', type=float)
        west = request.args.get('west', type=float)
        north = request.args.get('north', type=float)
        east = request.args.get('east', type=float)
        query = request.args.get('query')
        limit = request.args.get('limit', 100, type=int)
        
        logger.info(f"Buscando estabelecimentos com parâmetros: south={south}, west={west}, north={north}, east={east}, query={query}, limit={limit}")
        
        # Preparar limites de busca
        bounds = None
        if south is not None and west is not None and north is not None and east is not None:
            bounds = {
                "south": south,
                "west": west,
                "north": north,
                "east": east
            }
        
        # Buscar estabelecimentos via cliente BTC Map
        establishments = btcmap_client.search_establishments(bounds, query, limit)
        
        # Retornar resultado
        return jsonify({
            "success": True,
            "count": len(establishments),
            "establishments": establishments
        }), 200
    
    except Exception as e:
        # Erro ao buscar estabelecimentos
        logger.error(f"Erro ao buscar estabelecimentos: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/establishments/search', methods=['GET', 'OPTIONS'])
def api_search_establishments():
    """Versão compatível do endpoint de busca com prefixo /api"""
    if request.method == 'OPTIONS':
        return handle_options_request()
    
    logger.info("Redirecionando requisição para /establishments/search")
    return search_establishments()


# Rota de fallback para capturar todas as requisições OPTIONS
@app.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    logger.info(f"Tratando requisição OPTIONS para rota não mapeada: {path}")
    return handle_options_request()


# Rota de fallback para capturar todas as requisições não tratadas
@app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def fallback_handler(path):
    logger.warning(f"Rota não encontrada: {path}, método: {request.method}")
    return jsonify({
        "success": False,
        "error": "Rota não encontrada",
        "path": path,
        "method": request.method
    }), 404


if __name__ == '__main__':
    # Iniciar servidor
    logger.info(f"Iniciando servidor na porta {API_PORT}...")
    logger.info(f"Debug mode: {API_DEBUG}")
    logger.info(f"CORS permitido para origens: {ALLOWED_ORIGINS}")
    logger.info(f"URL da API do BTC Map: {BTCMAP_API_URL}")
    logger.info(f"Chave de API do BTC Map configurada: {bool(BTCMAP_API_KEY)}")
    logger.info(f"Autenticação OSM configurada: {bool(OSM_CLIENT_ID and OSM_CLIENT_SECRET)}")
    app.run(host=API_HOST, port=API_PORT, debug=API_DEBUG)
