import json
import logging
from datetime import datetime

def validate_establishment_data(data):
    """
    Valida os dados de um estabelecimento antes de enviá-los para o BTC Map.
    
    Args:
        data (dict): Dados do estabelecimento a serem validados
        
    Returns:
        tuple: (is_valid, errors) - Booleano indicando se os dados são válidos e lista de erros, se houver
    """
    errors = []
    
    # Verificar campos obrigatórios
    required_fields = ['name', 'lat', 'lon']
    for field in required_fields:
        if field not in data:
            errors.append(f"Campo obrigatório ausente: {field}")
    
    # Validar coordenadas
    if 'lat' in data:
        try:
            lat = float(data['lat'])
            if lat < -90 or lat > 90:
                errors.append("Latitude deve estar entre -90 e 90")
        except (ValueError, TypeError):
            errors.append("Latitude deve ser um número")
    
    if 'lon' in data:
        try:
            lon = float(data['lon'])
            if lon < -180 or lon > 180:
                errors.append("Longitude deve estar entre -180 e 180")
        except (ValueError, TypeError):
            errors.append("Longitude deve ser um número")
    
    # Validar outros campos
    if 'website' in data and data['website']:
        if not (data['website'].startswith('http://') or data['website'].startswith('https://')):
            errors.append("Website deve começar com http:// ou https://")
    
    return (len(errors) == 0, errors)

def format_osm_tags(establishment_data):
    """
    Formata os dados de um estabelecimento para o formato de tags do OpenStreetMap.
    
    Args:
        establishment_data (dict): Dados do estabelecimento
        
    Returns:
        dict: Tags formatadas para o OpenStreetMap
    """
    osm_tags = {
        "name": establishment_data["name"],
        "currency:XBT": "yes"
    }
    
    # Adicionar tags de pagamento
    if establishment_data.get("accepts_lightning"):
        osm_tags["payment:lightning"] = "yes"
    else:
        osm_tags["payment:lightning"] = "no"
        
    if establishment_data.get("accepts_onchain"):
        osm_tags["payment:onchain"] = "yes"
    else:
        osm_tags["payment:onchain"] = "no"
    
    # Adicionar outras tags relevantes
    if "website" in establishment_data and establishment_data["website"]:
        osm_tags["website"] = establishment_data["website"]
    
    if "phone" in establishment_data and establishment_data["phone"]:
        osm_tags["phone"] = establishment_data["phone"]
    
    # Adicionar tags de amenity se fornecidas
    if "type" in establishment_data:
        establishment_type = establishment_data["type"].lower()
        if establishment_type in ["restaurant", "cafe", "bar", "pub"]:
            osm_tags["amenity"] = establishment_type
        elif establishment_type == "loja" or establishment_type == "store":
            osm_tags["shop"] = "yes"
    
    # Adicionar tags personalizadas
    if "tags" in establishment_data and isinstance(establishment_data["tags"], dict):
        osm_tags.update(establishment_data["tags"])
    
    # Adicionar data de verificação
    today = datetime.now().strftime("%Y-%m-%d")
    osm_tags["check_date:currency:XBT"] = today
    
    return osm_tags

def log_to_file(action, data, result, filename="integration_log.json"):
    """
    Registra uma ação de integração em um arquivo de log.
    
    Args:
        action (str): Ação realizada (add, update, get, search)
        data (dict): Dados enviados
        result (dict): Resultado da ação
        filename (str): Nome do arquivo de log
    """
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "action": action,
        "data": data,
        "result": result
    }
    
    try:
        # Carregar logs existentes
        try:
            with open(filename, 'r') as f:
                logs = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            logs = []
        
        # Adicionar nova entrada
        logs.append(log_entry)
        
        # Salvar logs atualizados
        with open(filename, 'w') as f:
            json.dump(logs, f, indent=2)
    except Exception as e:
        logging.error(f"Erro ao registrar log: {e}")

def get_osm_url(osm_id):
    """
    Gera a URL para visualizar um elemento do OpenStreetMap.
    
    Args:
        osm_id (str): ID do elemento no OpenStreetMap (ex: "node/123456789")
        
    Returns:
        str: URL para visualizar o elemento
    """
    if not osm_id:
        return None
    
    try:
        element_type, element_id = osm_id.split('/')
        return f"https://www.openstreetmap.org/{element_type}/{element_id}"
    except:
        return None
