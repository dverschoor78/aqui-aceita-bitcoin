@echo off
echo Iniciando API de integracao com OpenStreetMap...

REM Definir o caminho completo para a pasta da API
set API_PATH=C:\Projetos\aqui-aceita-bitcoin-marco10\api\btcmap
cd /d %API_PATH%

echo Diretorio atual: %CD%
echo.

REM Verificar se os arquivos necessários existem
if exist integration_api.py (
    echo [OK] Arquivo integration_api.py encontrado.
) else (
    echo [ERRO] Arquivo integration_api.py nao encontrado!
    goto :error
)

REM Configurar variáveis de ambiente do Flask
set FLASK_APP=integration_api.py
set FLASK_DEBUG=1

echo.
echo Iniciando servidor Flask...
echo.
echo Para parar o servidor, pressione CTRL+C
echo.

REM Usar o caminho específico para Python 3.13
"C:\Users\dvers\AppData\Local\Programs\Python\Python313\python.exe" -m flask run --host=0.0.0.0 --port=5000
goto :end

:error
echo.
echo Ocorreu um erro ao iniciar a API. Verifique os arquivos necessarios.
echo.
pause
exit /b 1

:end
pause
