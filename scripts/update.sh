#!/bin/bash

# Script de atualização para o projeto "Aceita Bitcoin?"
# Este script automatiza o processo de atualização do repositório local

echo "=== Atualização do Projeto 'Aceita Bitcoin?' ==="
echo "Iniciando processo de atualização..."

# Verificar se o Git está instalado
if ! command -v git &> /dev/null; then
    echo "ERRO: Git não encontrado. Por favor, instale o Git antes de continuar."
    echo "Instruções: https://git-scm.com/book/pt-br/v2/Come%C3%A7ando-Instalando-o-Git"
    exit 1
fi

# Verificar se estamos no diretório correto
if [ ! -f "index.html" ] || [ ! -d "css" ] || [ ! -d "js" ]; then
    echo "ERRO: Este script deve ser executado no diretório raiz do projeto."
    echo "Por favor, navegue até o diretório que contém index.html, css/ e js/"
    exit 1
fi

# Verificar se é um repositório Git
if [ ! -d ".git" ]; then
    echo "ERRO: Este diretório não é um repositório Git."
    echo "Execute './scripts/setup.sh' para configurar o repositório."
    exit 1
fi

# Verificar se há alterações locais não salvas
if ! git diff-index --quiet HEAD --; then
    echo "AVISO: Você tem alterações locais não salvas."
    echo "Recomendamos fazer commit das suas alterações antes de atualizar."
    read -p "Deseja continuar mesmo assim? (s/n): " continue_anyway
    if [ "$continue_anyway" != "s" ]; then
        exit 1
    fi
fi

# Verificar se o remote origin está configurado
if ! git remote get-url origin &> /dev/null; then
    echo "ERRO: Remote 'origin' não configurado."
    echo "Para configurar, use: git remote add origin https://github.com/seu-usuario/aqui-aceita-bitcoin.git"
    exit 1
fi

# Fazer backup das alterações locais
echo "Criando backup das alterações locais..."
timestamp=$(date +"%Y%m%d_%H%M%S")
backup_dir="backup_$timestamp"
mkdir -p "$backup_dir"
cp -r *.html css js img downloads "$backup_dir/"
echo "✓ Backup criado em: $backup_dir"

# Atualizar o repositório
echo "Atualizando o repositório..."
git fetch origin

# Verificar se há atualizações disponíveis
if git rev-parse HEAD == git rev-parse origin/main; then
    echo "O repositório já está atualizado. Nenhuma atualização disponível."
    exit 0
fi

# Aplicar as atualizações
echo "Aplicando atualizações..."
git pull origin main

# Verificar se a atualização foi bem-sucedida
if [ $? -ne 0 ]; then
    echo "ERRO: Ocorreu um problema durante a atualização."
    echo "Suas alterações locais podem estar em conflito com as atualizações."
    echo "Você pode restaurar o backup de: $backup_dir"
    exit 1
fi

echo "✓ Atualização concluída com sucesso!"
echo "O projeto 'Aceita Bitcoin?' foi atualizado para a versão mais recente."
echo ""
echo "Para verificar as alterações, consulte o CHANGELOG.md"
echo "Se encontrar problemas, você pode restaurar o backup de: $backup_dir"
