#!/bin/bash

# Script de deploy para o projeto "Aqui aceita Bitcoin?"
# Este script automatiza o processo de deploy do site

echo "=== Deploy do Projeto 'Aqui aceita Bitcoin?' ==="
echo "Iniciando processo de deploy..."

# Verificar se estamos no diretório correto
if [ ! -f "index.html" ] || [ ! -d "css" ] || [ ! -d "js" ]; then
    echo "ERRO: Este script deve ser executado no diretório raiz do projeto."
    echo "Por favor, navegue até o diretório que contém index.html, css/ e js/"
    exit 1
fi

# Verificar se o destino foi especificado
if [ -z "$1" ]; then
    echo "Uso: ./deploy.sh [github|local|ftp]"
    echo "  github: Prepara e faz push para o GitHub Pages"
    echo "  local: Prepara os arquivos para hospedagem local"
    echo "  ftp: Prepara os arquivos para upload via FTP"
    exit 1
fi

# Função para preparar os arquivos
prepare_files() {
    echo "Preparando arquivos para deploy..."
    
    # Verificar se há erros nos arquivos HTML
    echo "Verificando arquivos HTML..."
    for file in *.html; do
        if [ -f "$file" ]; then
            if grep -q "TODO" "$file"; then
                echo "AVISO: $file contém marcações TODO"
            fi
        fi
    done
    
    # Verificar se há erros nos arquivos CSS
    echo "Verificando arquivos CSS..."
    for file in css/*.css; do
        if [ -f "$file" ]; then
            if grep -q "TODO" "$file"; then
                echo "AVISO: $file contém marcações TODO"
            fi
        fi
    done
    
    # Verificar se há erros nos arquivos JS
    echo "Verificando arquivos JavaScript..."
    for file in js/*.js; do
        if [ -f "$file" ]; then
            if grep -q "TODO" "$file"; then
                echo "AVISO: $file contém marcações TODO"
            fi
            if grep -q "console.log" "$file"; then
                echo "AVISO: $file contém console.log (considere remover para produção)"
            fi
        fi
    done
    
    echo "✓ Verificação de arquivos concluída"
}

# Deploy para GitHub Pages
deploy_github() {
    echo "Preparando deploy para GitHub Pages..."
    
    # Verificar se o Git está instalado
    if ! command -v git &> /dev/null; then
        echo "ERRO: Git não encontrado. Por favor, instale o Git antes de continuar."
        exit 1
    fi
    
    # Verificar se é um repositório Git
    if [ ! -d ".git" ]; then
        echo "ERRO: Este diretório não é um repositório Git."
        echo "Execute 'git init' para inicializar o repositório."
        exit 1
    fi
    
    # Verificar se o remote origin está configurado
    if ! git remote get-url origin &> /dev/null; then
        echo "AVISO: Remote 'origin' não configurado."
        echo "Para configurar, use: git remote add origin https://github.com/seu-usuario/aqui-aceita-bitcoin.git"
        read -p "Deseja continuar mesmo assim? (s/n): " continue_anyway
        if [ "$continue_anyway" != "s" ]; then
            exit 1
        fi
    fi
    
    # Adicionar todos os arquivos
    git add .
    
    # Commit
    read -p "Mensagem de commit: " commit_message
    if [ -z "$commit_message" ]; then
        commit_message="Atualização do site"
    fi
    
    git commit -m "$commit_message"
    
    # Push
    echo "Enviando para o GitHub..."
    git push origin main
    
    echo "✓ Deploy para GitHub Pages concluído!"
    echo "O site estará disponível em alguns minutos em: https://seu-usuario.github.io/aqui-aceita-bitcoin"
}

# Deploy para hospedagem local
deploy_local() {
    echo "Preparando deploy para hospedagem local..."
    
    # Criar diretório de build se não existir
    if [ ! -d "build" ]; then
        mkdir build
    else
        # Limpar diretório de build
        rm -rf build/*
    fi
    
    # Copiar arquivos para o diretório de build
    cp -r *.html css js img downloads build/
    
    echo "✓ Deploy local concluído!"
    echo "Os arquivos estão no diretório 'build/'"
    echo "Copie estes arquivos para o diretório do seu servidor web."
}

# Deploy para FTP
deploy_ftp() {
    echo "Preparando deploy para FTP..."
    
    # Verificar se o cliente FTP está instalado
    if ! command -v ftp &> /dev/null && ! command -v lftp &> /dev/null; then
        echo "ERRO: Cliente FTP não encontrado. Por favor, instale 'ftp' ou 'lftp' antes de continuar."
        exit 1
    fi
    
    # Criar diretório de build se não existir
    if [ ! -d "build" ]; then
        mkdir build
    else
        # Limpar diretório de build
        rm -rf build/*
    fi
    
    # Copiar arquivos para o diretório de build
    cp -r *.html css js img downloads build/
    
    echo "✓ Arquivos preparados para upload FTP"
    echo "Os arquivos estão no diretório 'build/'"
    
    # Solicitar informações de FTP
    read -p "Servidor FTP: " ftp_server
    read -p "Usuário FTP: " ftp_user
    read -s -p "Senha FTP: " ftp_pass
    echo ""
    read -p "Diretório remoto (deixe em branco para raiz): " ftp_dir
    
    if command -v lftp &> /dev/null; then
        # Usar lftp (mais avançado)
        echo "Usando lftp para upload..."
        
        # Criar script temporário para lftp
        cat > /tmp/lftp_script << EOF
open -u $ftp_user,$ftp_pass $ftp_server
lcd build
cd $ftp_dir
mirror -R
bye
EOF
        
        # Executar lftp com o script
        lftp -f /tmp/lftp_script
        
        # Remover script temporário
        rm /tmp/lftp_script
    else
        # Usar ftp padrão
        echo "Usando ftp para upload..."
        echo "AVISO: O upload manual será necessário."
        echo "Use os seguintes comandos no prompt do FTP:"
        echo "  open $ftp_server"
        echo "  user $ftp_user"
        echo "  cd $ftp_dir"
        echo "  prompt"
        echo "  mput build/*"
        echo "  bye"
        
        # Iniciar cliente FTP
        ftp
    fi
    
    echo "✓ Processo de deploy FTP concluído!"
}

# Preparar arquivos
prepare_files

# Executar o deploy conforme o destino especificado
case "$1" in
    github)
        deploy_github
        ;;
    local)
        deploy_local
        ;;
    ftp)
        deploy_ftp
        ;;
    *)
        echo "ERRO: Destino de deploy desconhecido: $1"
        echo "Uso: ./deploy.sh [github|local|ftp]"
        exit 1
        ;;
esac

echo ""
echo "=== Deploy concluído com sucesso! ==="
