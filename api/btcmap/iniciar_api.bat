@echo off
echo Iniciando API de integracao com OpenStreetMap...
cd /d %~dp0
set FLASK_APP=integration_api.py
set FLASK_DEBUG=1
echo.
echo Diretorio atual: %CD%
echo.
echo Verificando arquivos necessarios...
if exist integration_api.py (
    echo [OK] Arquivo integration_api.py encontrado.
) else (
    echo [ERRO] Arquivo integration_api.py nao encontrado!
    goto :error
)

if exist config.py (
    echo [OK] Arquivo config.py encontrado.
) else (
    echo [AVISO] Arquivo config.py nao encontrado. Usando configuracoes padrao.
)

if exist btcmap_client.py (
    echo [OK] Arquivo btcmap_client.py encontrado.
) else (
    echo [ERRO] Arquivo btcmap_client.py nao encontrado!
    goto :error
)

echo.
echo Iniciando servidor Flask...
echo.
echo Para parar o servidor, pressione CTRL+C
echo.
"C:\Users\dvers\AppData\Local\Programs\Python\Python311\python.exe" -m flask run --host=0.0.0.0 --port=5000
goto :end

:error
echo.
echo Ocorreu um erro ao iniciar a API. Verifique os arquivos necessarios.
echo.
pause
exit /b 1

:end
pause
