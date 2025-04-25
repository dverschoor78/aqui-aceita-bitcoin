#!/usr/bin/env python3
"""
Script para analisar os pontos cadastrados no OpenStreetMap que aceitam Bitcoin
e gerar uma tabela de distribuição por município.
"""

import os
import sys
import json
import requests
from collections import defaultdict
from datetime import datetime

# Adicionar diretório pai ao path para importar módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Coordenadas aproximadas dos municípios de interesse
MUNICIPIOS = {
    "Ponta Grossa": {
        "centro": [-25.0945, -50.1633],
        "bbox": [-25.2945, -50.3633, -24.8945, -49.9633]  # [sul, oeste, norte, leste]
    },
    "Carambeí": {
        "centro": [-24.9421, -50.0995],
        "bbox": [-25.0421, -50.1995, -24.8421, -49.9995]
    },
    "Telêmaco Borba": {
        "centro": [-24.3245, -50.6176],
        "bbox": [-24.4245, -50.7176, -24.2245, -50.5176]
    }
}

def obter_estabelecimentos_overpass():
    """
    Obtém estabelecimentos que aceitam Bitcoin usando a API Overpass do OpenStreetMap.
    
    Returns:
        Lista de estabelecimentos encontrados.
    """
    print("Consultando API Overpass para obter estabelecimentos que aceitam Bitcoin...")
    
    # Construir query para a API Overpass
    # Usamos uma bounding box que engloba os três municípios
    sul = min(m["bbox"][0] for m in MUNICIPIOS.values())
    oeste = min(m["bbox"][1] for m in MUNICIPIOS.values())
    norte = max(m["bbox"][2] for m in MUNICIPIOS.values())
    leste = max(m["bbox"][3] for m in MUNICIPIOS.values())
    
    overpass_url = "https://overpass-api.de/api/interpreter"
    query = f"""
        [out:json];
        (
          node["currency:XBT"="yes"]({sul},{oeste},{norte},{leste});
          way["currency:XBT"="yes"]({sul},{oeste},{norte},{leste});
          relation["currency:XBT"="yes"]({sul},{oeste},{norte},{leste});
        );
        out center;
    """
    
    try:
        response = requests.post(overpass_url, data=query)
        response.raise_for_status()
        data = response.json()
        return data.get("elements", [])
    except Exception as e:
        print(f"Erro ao consultar API Overpass: {e}")
        return []

def classificar_por_municipio(estabelecimentos):
    """
    Classifica os estabelecimentos por município com base em suas coordenadas.
    
    Args:
        estabelecimentos: Lista de estabelecimentos a classificar.
        
    Returns:
        Dicionário com contagem de estabelecimentos por município.
    """
    print("Classificando estabelecimentos por município...")
    
    resultado = defaultdict(list)
    nao_classificados = []
    
    for estab in estabelecimentos:
        # Obter coordenadas do estabelecimento
        if estab["type"] == "node":
            lat, lon = estab["lat"], estab["lon"]
        else:
            # Para ways e relations, usar o centro
            lat, lon = estab["center"]["lat"], estab["center"]["lon"]
        
        # Verificar em qual município o estabelecimento está
        municipio_encontrado = False
        for nome, info in MUNICIPIOS.items():
            bbox = info["bbox"]
            if bbox[0] <= lat <= bbox[2] and bbox[1] <= lon <= bbox[3]:
                # Extrair informações relevantes
                info_estab = {
                    "id": estab["id"],
                    "tipo": estab["type"],
                    "nome": estab.get("tags", {}).get("name", "Sem nome"),
                    "lat": lat,
                    "lon": lon,
                    "lightning": estab.get("tags", {}).get("payment:lightning") == "yes",
                    "onchain": estab.get("tags", {}).get("payment:onchain") == "yes",
                    "tags": estab.get("tags", {})
                }
                resultado[nome].append(info_estab)
                municipio_encontrado = True
                break
        
        if not municipio_encontrado:
            # Estabelecimento fora dos municípios de interesse
            info_estab = {
                "id": estab["id"],
                "tipo": estab["type"],
                "nome": estab.get("tags", {}).get("name", "Sem nome"),
                "lat": lat,
                "lon": lon,
                "lightning": estab.get("tags", {}).get("payment:lightning") == "yes",
                "onchain": estab.get("tags", {}).get("payment:onchain") == "yes",
                "tags": estab.get("tags", {})
            }
            nao_classificados.append(info_estab)
    
    # Adicionar não classificados ao resultado
    if nao_classificados:
        resultado["Outros"] = nao_classificados
    
    return resultado

def gerar_tabela_html(dados_municipios):
    """
    Gera uma tabela HTML com os dados dos estabelecimentos por município.
    
    Args:
        dados_municipios: Dicionário com estabelecimentos por município.
        
    Returns:
        String com o HTML da tabela.
    """
    print("Gerando tabela HTML...")
    
    # Calcular totais
    total_geral = sum(len(estabs) for estabs in dados_municipios.values())
    total_lightning = sum(sum(1 for e in estabs if e["lightning"]) for estabs in dados_municipios.values())
    total_onchain = sum(sum(1 for e in estabs if e["onchain"]) for estabs in dados_municipios.values())
    
    # Iniciar HTML
    html = f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Análise de Estabelecimentos Bitcoin</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                color: #333;
            }}
            h1, h2, h3 {{
                color: #f7931a;
            }}
            table {{
                border-collapse: collapse;
                width: 100%;
                margin-bottom: 20px;
            }}
            th, td {{
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }}
            th {{
                background-color: #f7931a;
                color: white;
            }}
            tr:nth-child(even) {{
                background-color: #f2f2f2;
            }}
            .summary {{
                background-color: #fff9e6;
                border-left: 4px solid #f7931a;
                padding: 15px;
                margin-bottom: 20px;
            }}
            .timestamp {{
                color: #666;
                font-style: italic;
                margin-top: 30px;
            }}
        </style>
    </head>
    <body>
        <h1>Análise de Estabelecimentos que Aceitam Bitcoin</h1>
        
        <div class="summary">
            <h2>Resumo</h2>
            <p><strong>Total de estabelecimentos:</strong> {total_geral}</p>
            <p><strong>Aceitam Lightning Network:</strong> {total_lightning}</p>
            <p><strong>Aceitam Bitcoin On-chain:</strong> {total_onchain}</p>
        </div>
        
        <h2>Distribuição por Município</h2>
        <table>
            <tr>
                <th>Município</th>
                <th>Total</th>
                <th>Lightning</th>
                <th>On-chain</th>
            </tr>
    """
    
    # Adicionar linha para cada município
    for municipio, estabs in sorted(dados_municipios.items()):
        lightning = sum(1 for e in estabs if e["lightning"])
        onchain = sum(1 for e in estabs if e["onchain"])
        html += f"""
            <tr>
                <td>{municipio}</td>
                <td>{len(estabs)}</td>
                <td>{lightning}</td>
                <td>{onchain}</td>
            </tr>
        """
    
    # Adicionar linha de total
    html += f"""
            <tr>
                <th>Total</th>
                <th>{total_geral}</th>
                <th>{total_lightning}</th>
                <th>{total_onchain}</th>
            </tr>
        </table>
    """
    
    # Adicionar tabelas detalhadas por município
    for municipio, estabs in sorted(dados_municipios.items()):
        if not estabs:
            continue
            
        html += f"""
        <h2>Detalhes: {municipio}</h2>
        <table>
            <tr>
                <th>Nome</th>
                <th>ID OSM</th>
                <th>Tipo</th>
                <th>Lightning</th>
                <th>On-chain</th>
                <th>Coordenadas</th>
            </tr>
        """
        
        for estab in sorted(estabs, key=lambda e: e["nome"]):
            lightning = "✓" if estab["lightning"] else "✗"
            onchain = "✓" if estab["onchain"] else "✗"
            coords = f"{estab['lat']:.6f}, {estab['lon']:.6f}"
            
            html += f"""
            <tr>
                <td>{estab["nome"]}</td>
                <td>{estab["tipo"]}/{estab["id"]}</td>
                <td>{estab["tipo"]}</td>
                <td>{lightning}</td>
                <td>{onchain}</td>
                <td>{coords}</td>
            </tr>
            """
        
        html += "</table>"
    
    # Finalizar HTML
    timestamp = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    html += f"""
        <p class="timestamp">Relatório gerado em: {timestamp}</p>
    </body>
    </html>
    """
    
    return html

def main():
    """Função principal do script."""
    print("Iniciando análise de estabelecimentos Bitcoin...")
    
    # Obter estabelecimentos da API Overpass
    estabelecimentos = obter_estabelecimentos_overpass()
    print(f"Encontrados {len(estabelecimentos)} estabelecimentos no total.")
    
    # Classificar por município
    dados_municipios = classificar_por_municipio(estabelecimentos)
    
    # Imprimir resumo no console
    print("\nResumo por município:")
    for municipio, estabs in sorted(dados_municipios.items()):
        print(f"- {municipio}: {len(estabs)} estabelecimentos")
    
    # Gerar tabela HTML
    html = gerar_tabela_html(dados_municipios)
    
    # Salvar HTML
    output_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 
                              "../analise_estabelecimentos.html")
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(html)
    
    print(f"\nTabela HTML gerada com sucesso: {output_file}")
    
    # Salvar dados brutos em JSON para referência
    json_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 
                            "../dados_estabelecimentos.json")
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(dados_municipios, f, ensure_ascii=False, indent=2)
    
    print(f"Dados JSON salvos: {json_file}")
    
    # Retornar contagem para uso em outros scripts
    return {municipio: len(estabs) for municipio, estabs in dados_municipios.items()}

if __name__ == "__main__":
    main()
