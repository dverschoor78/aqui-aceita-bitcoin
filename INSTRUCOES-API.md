# Instruções para Execução da API de Integração com OpenStreetMap

Este documento fornece instruções detalhadas sobre como executar e manter a API de integração com o OpenStreetMap para o projeto "Aqui aceita Bitcoin?".

## Pré-requisitos

- Python 3.6 ou superior
- Flask
- Requests

## Instalação de Dependências

```bash
pip3 install flask flask-cors requests
```

## Configuração

1. Navegue até o diretório da API:

```bash
cd /caminho/para/aqui-aceita-bitcoin-marco10/api/btcmap
```

2. Verifique se o arquivo `config.py` existe e contém as configurações corretas:

```python
# URL da API do BTC Map
BTCMAP_API_URL = "https://api.btcmap.org/v2/rpc"

# Chave de API do BTC Map (substitua por uma chave válida em produção)
BTCMAP_API_KEY = "sua_chave_api_aqui"

# Configurações da API de integração
API_HOST = "0.0.0.0"
API_PORT = 5000
API_DEBUG = False

# Origens permitidas para CORS
ALLOWED_ORIGINS = ["*"]
```

3. Se o arquivo não existir, crie-o baseado no exemplo `config.example.py`.

## Execução Manual

Para iniciar a API manualmente:

```bash
cd /caminho/para/aqui-aceita-bitcoin-marco10/api/btcmap
python3 -m flask --app integration_api run --host=0.0.0.0 --port=5000
```

Mantenha este terminal aberto enquanto estiver usando o sistema de sincronização.

## Configuração como Serviço (Produção)

Para ambientes de produção, é recomendável configurar a API como um serviço que inicia automaticamente.

### Usando Systemd (Linux)

1. Crie um arquivo de serviço:

```bash
sudo nano /etc/systemd/system/btcmap-api.service
```

2. Adicione o seguinte conteúdo (ajuste os caminhos conforme necessário):

```
[Unit]
Description=BTC Map Integration API
After=network.target

[Service]
User=seu_usuario
WorkingDirectory=/caminho/para/aqui-aceita-bitcoin-marco10/api/btcmap
ExecStart=/usr/bin/python3 -m flask --app integration_api run --host=0.0.0.0 --port=5000
Restart=always
Environment=FLASK_ENV=production

[Install]
WantedBy=multi-user.target
```

3. Habilite e inicie o serviço:

```bash
sudo systemctl enable btcmap-api
sudo systemctl start btcmap-api
```

4. Verifique o status do serviço:

```bash
sudo systemctl status btcmap-api
```

### Usando Supervisor

1. Instale o Supervisor:

```bash
sudo apt-get install supervisor
```

2. Crie um arquivo de configuração:

```bash
sudo nano /etc/supervisor/conf.d/btcmap-api.conf
```

3. Adicione o seguinte conteúdo (ajuste os caminhos conforme necessário):

```
[program:btcmap-api]
command=/usr/bin/python3 -m flask --app integration_api run --host=0.0.0.0 --port=5000
directory=/caminho/para/aqui-aceita-bitcoin-marco10/api/btcmap
user=seu_usuario
autostart=true
autorestart=true
stderr_logfile=/var/log/btcmap-api.err.log
stdout_logfile=/var/log/btcmap-api.out.log
environment=FLASK_ENV=production
```

4. Recarregue o Supervisor e inicie o serviço:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start btcmap-api
```

### Usando Docker

1. Crie um Dockerfile no diretório da API:

```bash
nano Dockerfile
```

2. Adicione o seguinte conteúdo:

```Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY . /app/

RUN pip install --no-cache-dir flask flask-cors requests

EXPOSE 5000

CMD ["python", "-m", "flask", "--app", "integration_api", "run", "--host=0.0.0.0", "--port=5000"]
```

3. Construa e execute o contêiner:

```bash
docker build -t btcmap-api .
docker run -d -p 5000:5000 --name btcmap-api-container btcmap-api
```

## Verificação da API

Para verificar se a API está em execução corretamente:

```bash
curl http://localhost:5000/health
```

Você deve receber uma resposta como:

```json
{
  "status": "ok",
  "message": "API de integração com BTC Map está funcionando"
}
```

## Solução de Problemas

### API não está respondendo (erro 404)

- Verifique se a API está em execução
- Confirme que a porta 5000 está disponível e não bloqueada por firewall
- Verifique os logs para erros específicos

### Erros de conexão com o OpenStreetMap

- Verifique se a chave de API no arquivo `config.py` é válida
- Confirme que a URL da API do BTC Map está correta
- Verifique se há conectividade com a internet

### Logs e Monitoramento

Para visualizar os logs da API quando executada manualmente:

- Os logs são exibidos diretamente no terminal

Para visualizar os logs quando executada como serviço:

- Systemd: `sudo journalctl -u btcmap-api`
- Supervisor: `cat /var/log/btcmap-api.out.log` e `cat /var/log/btcmap-api.err.log`
- Docker: `docker logs btcmap-api-container`

## Considerações de Segurança

- Em ambiente de produção, considere usar HTTPS
- Restrinja as origens permitidas para CORS no arquivo `config.py`
- Considere implementar autenticação para a API
- Mantenha a chave de API do BTC Map segura e não a compartilhe

## Manutenção

- Verifique regularmente os logs para erros
- Reinicie a API após atualizações no código
- Faça backup regular do arquivo `config.py`
- Monitore o uso de recursos (CPU, memória) para garantir desempenho adequado
