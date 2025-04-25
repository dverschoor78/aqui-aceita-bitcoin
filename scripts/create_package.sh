#!/bin/bash

# Script para criar um arquivo ZIP do projeto "Aqui aceita Bitcoin?"
# Este script facilita a criação de um pacote para download

echo "=== Criando pacote ZIP do Projeto 'Aqui aceita Bitcoin?' ==="
echo "Iniciando processo de empacotamento..."

# Verificar se estamos no diretório correto
if [ ! -f "index.html" ] || [ ! -d "css" ] || [ ! -d "js" ]; then
    echo "ERRO: Este script deve ser executado no diretório raiz do projeto."
    echo "Por favor, navegue até o diretório que contém index.html, css/ e js/"
    exit 1
fi

# Criar diretório temporário para organizar os arquivos
echo "Preparando arquivos para empacotamento..."
temp_dir="temp_package"
mkdir -p "$temp_dir"

# Copiar arquivos principais
cp -r *.html css js img downloads scripts docs README.md CHANGELOG.md KNOWN_ISSUES.md REPOSITORY_STRUCTURE.md .gitignore "$temp_dir/"

# Verificar se o zip está instalado
if ! command -v zip &> /dev/null; then
    echo "AVISO: O comando 'zip' não está instalado. Tentando instalar..."
    sudo apt-get update && sudo apt-get install -y zip
    if [ $? -ne 0 ]; then
        echo "ERRO: Não foi possível instalar o 'zip'. Por favor, instale manualmente."
        echo "Arquivos preparados estão disponíveis no diretório: $temp_dir"
        exit 1
    fi
fi

# Criar o arquivo ZIP
echo "Criando arquivo ZIP..."
zip_file="aqui-aceita-bitcoin.zip"
zip -r "$zip_file" "$temp_dir"/*

# Mover o ZIP para o diretório de downloads
mv "$zip_file" "downloads/"

# Limpar diretório temporário
rm -rf "$temp_dir"

echo "✓ Pacote ZIP criado com sucesso!"
echo "O arquivo está disponível em: downloads/$zip_file"
echo ""
echo "Para disponibilizar este arquivo para download no site:"
echo "1. Adicione um link para 'downloads/$zip_file' em sua página"
echo "2. Exemplo de HTML: <a href='downloads/$zip_file'>Baixar Projeto Completo</a>"
