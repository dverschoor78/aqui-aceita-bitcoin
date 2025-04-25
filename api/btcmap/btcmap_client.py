"""
Módulo cliente para interação com a API do BTC Map.

Este módulo fornece funções para interagir com a API do BTC Map,
permitindo cadastrar e atualizar estabelecimentos no OpenStreetMap
que aceitam Bitcoin.
"""

import json
import logging
import requests
from typing import Dict, Any, Optional, List

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("btcmap_client")

try:
    from config import BTCMAP_API_URL, BTCMAP_API_KEY
except ImportError:
    logger.warning("Arquivo config.py não encontrado. Usando valores padrão.")
    BTCMAP_API_URL = "https://api.btcmap.org/v2/rpc"
    BTCMAP_API_KEY = "YOUR_API_KEY_HERE"


class BTCMapClient:
    """Cliente para interação com a API do BTC Map."""

    def __init__(self, api_url: str = None, api_key: str = None):
        """
        Inicializa o cliente BTC Map.

        Args:
            api_url: URL da API do BTC Map. Se não fornecido, usa o valor de config.py.
            api_key: Chave de API do BTC Map. Se não fornecida, usa o valor de config.py.
        """
        self.api_url = api_url or BTCMAP_API_URL
        self.api_key = api_key or BTCMAP_API_KEY
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

    def add_establishment(self, establishment: Dict[str, Any]) -> Dict[str, Any]:
        """
        Adiciona um novo estabelecimento ao OpenStreetMap via BTC Map.

        Args:
            establishment: Dicionário com os dados do estabelecimento.
                Deve conter pelo menos: name, lat, lon, accepts_lightning, accepts_onchain.

        Returns:
            Dicionário com o resultado da operação.

        Raises:
            requests.RequestException: Se ocorrer um erro na requisição.
        """
        # Validar dados mínimos
        required_fields = ["name", "lat", "lon"]
        for field in required_fields:
            if field not in establishment:
                raise ValueError(f"Campo obrigatório ausente: {field}")

        # Preparar dados para a API
        tags = {
            "name": establishment["name"],
            "currency:XBT": "yes"
        }

        # Adicionar tags de métodos de pagamento
        if establishment.get("accepts_lightning"):
            tags["payment:lightning"] = "yes"
        if establishment.get("accepts_onchain"):
            tags["payment:onchain"] = "yes"

        # Adicionar tags opcionais
        if "address" in establishment:
            tags["addr:full"] = establishment["address"]
        if "website" in establishment:
            tags["website"] = establishment["website"]
        if "phone" in establishment:
            tags["phone"] = establishment["phone"]
        if "description" in establishment:
            tags["description"] = establishment["description"]

        # Adicionar tags personalizadas
        if "tags" in establishment and isinstance(establishment["tags"], dict):
            for key, value in establishment["tags"].items():
                tags[key] = value

        # Preparar payload para a API
        payload = {
            "method": "add_node",
            "params": {
                "lat": establishment["lat"],
                "lon": establishment["lon"],
                "tags": tags
            }
        }

        try:
            # Fazer requisição para a API
            response = requests.post(
                self.api_url,
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Erro na requisição para a API do BTC Map: {e}")
            raise

    def update_establishment(self, osm_id: str, establishment: Dict[str, Any]) -> Dict[str, Any]:
        """
        Atualiza um estabelecimento existente no OpenStreetMap via BTC Map.

        Args:
            osm_id: ID do estabelecimento no OpenStreetMap.
            establishment: Dicionário com os dados atualizados do estabelecimento.

        Returns:
            Dicionário com o resultado da operação.

        Raises:
            requests.RequestException: Se ocorrer um erro na requisição.
        """
        # Preparar tags para atualização
        tags = {}
        if "name" in establishment:
            tags["name"] = establishment["name"]
        if "accepts_lightning" in establishment:
            tags["payment:lightning"] = "yes" if establishment["accepts_lightning"] else "no"
        if "accepts_onchain" in establishment:
            tags["payment:onchain"] = "yes" if establishment["accepts_onchain"] else "no"
        if "address" in establishment:
            tags["addr:full"] = establishment["address"]
        if "website" in establishment:
            tags["website"] = establishment["website"]
        if "phone" in establishment:
            tags["phone"] = establishment["phone"]
        if "description" in establishment:
            tags["description"] = establishment["description"]

        # Adicionar tags personalizadas
        if "tags" in establishment and isinstance(establishment["tags"], dict):
            for key, value in establishment["tags"].items():
                tags[key] = value

        # Preparar payload para a API
        payload = {
            "method": "update_node",
            "params": {
                "id": osm_id,
                "tags": tags
            }
        }

        try:
            # Fazer requisição para a API
            response = requests.post(
                self.api_url,
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Erro na requisição para a API do BTC Map: {e}")
            raise

    def search_establishments(self, 
                             bounds: Optional[Dict[str, float]] = None,
                             query: Optional[str] = None,
                             limit: int = 100) -> List[Dict[str, Any]]:
        """
        Busca estabelecimentos que aceitam Bitcoin no OpenStreetMap via BTC Map.

        Args:
            bounds: Dicionário com os limites da busca (south, west, north, east).
            query: Termo de busca opcional.
            limit: Número máximo de resultados.

        Returns:
            Lista de estabelecimentos encontrados.

        Raises:
            requests.RequestException: Se ocorrer um erro na requisição.
        """
        # Preparar payload para a API
        payload = {
            "method": "search_nodes",
            "params": {
                "limit": limit
            }
        }

        # Adicionar parâmetros opcionais
        if bounds:
            payload["params"]["bounds"] = bounds
        if query:
            payload["params"]["query"] = query

        try:
            # Fazer requisição para a API
            response = requests.post(
                self.api_url,
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            return response.json().get("result", [])
        except requests.RequestException as e:
            logger.error(f"Erro na requisição para a API do BTC Map: {e}")
            raise


# Função auxiliar para criar uma instância do cliente
def get_client(api_url: str = None, api_key: str = None) -> BTCMapClient:
    """
    Cria e retorna uma instância do cliente BTC Map.

    Args:
        api_url: URL da API do BTC Map. Se não fornecido, usa o valor de config.py.
        api_key: Chave de API do BTC Map. Se não fornecida, usa o valor de config.py.

    Returns:
        Instância do cliente BTC Map.
    """
    return BTCMapClient(api_url, api_key)
