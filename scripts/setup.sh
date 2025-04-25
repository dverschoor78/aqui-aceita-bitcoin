#!/bin/bash

# Script de configuração para o projeto "Aqui aceita Bitcoin?"
# Este script automatiza a configuração inicial do ambiente de desenvolvimento

echo "=== Configuração do Projeto 'Aqui aceita Bitcoin?' ==="
echo "Iniciando configuração..."

# Verificar se o Git está instalado
if ! command -v git &> /dev/null; then
    echo "Git não encontrado. Por favor, instale o Git antes de continuar."
    echo "Instruções: https://git-scm.com/book/pt-br/v2/Come%C3%A7ando-Instalando-o-Git"
    exit 1
fi

# Verificar se estamos no diretório correto
if [ ! -f "index.html" ] || [ ! -d "css" ] || [ ! -d "js" ]; then
    echo "ERRO: Este script deve ser executado no diretório raiz do projeto."
    echo "Por favor, navegue até o diretório que contém index.html, css/ e js/"
    exit 1
fi

echo "✓ Diretório do projeto verificado"

# Criar diretórios necessários se não existirem
mkdir -p docs/user docs/admin docs/technical docs/images/screenshots
mkdir -p scripts
mkdir -p downloads

echo "✓ Estrutura de diretórios criada/verificada"

# Verificar se os arquivos principais existem
ARQUIVOS_PRINCIPAIS=("index.html" "sobre.html" "cadastro.html" "carteiras.html" "materiais.html" "admin.html")
ARQUIVOS_FALTANDO=()

for arquivo in "${ARQUIVOS_PRINCIPAIS[@]}"; do
    if [ ! -f "$arquivo" ]; then
        ARQUIVOS_FALTANDO+=("$arquivo")
    fi
done

if [ ${#ARQUIVOS_FALTANDO[@]} -ne 0 ]; then
    echo "AVISO: Os seguintes arquivos principais estão faltando:"
    for arquivo in "${ARQUIVOS_FALTANDO[@]}"; do
        echo "  - $arquivo"
    done
    echo "O projeto pode não funcionar corretamente sem estes arquivos."
else
    echo "✓ Todos os arquivos principais verificados"
fi

# Inicializar Git se não estiver inicializado
if [ ! -d ".git" ]; then
    echo "Inicializando repositório Git..."
    git init
    echo "✓ Repositório Git inicializado"
    
    # Criar .gitignore básico
    if [ ! -f ".gitignore" ]; then
        echo "Criando arquivo .gitignore..."
        cat > .gitignore << EOF
# Arquivos do sistema
.DS_Store
Thumbs.db
desktop.ini

# Arquivos de configuração de editores
.vscode/
.idea/
*.sublime-project
*.sublime-workspace

# Arquivos temporários
*.tmp
*.bak
*.swp
*~

# Logs
*.log
logs/
EOF
        echo "✓ Arquivo .gitignore criado"
    fi
else
    echo "✓ Repositório Git já inicializado"
fi

# Verificar se o servidor local está disponível
echo "Verificando disponibilidade de servidor local..."

if command -v python3 &> /dev/null; then
    echo "Python 3 encontrado. Você pode iniciar um servidor local com o comando:"
    echo "  python3 -m http.server"
    echo "  Acesse: http://localhost:8000"
elif command -v python &> /dev/null; then
    echo "Python encontrado. Você pode iniciar um servidor local com o comando:"
    echo "  python -m SimpleHTTPServer"
    echo "  Acesse: http://localhost:8000"
elif command -v php &> /dev/null; then
    echo "PHP encontrado. Você pode iniciar um servidor local com o comando:"
    echo "  php -S localhost:8000"
    echo "  Acesse: http://localhost:8000"
else
    echo "AVISO: Nenhum servidor local encontrado (Python ou PHP)."
    echo "Recomendamos instalar Python ou usar uma extensão como Live Server no VS Code."
fi

echo ""
echo "=== Configuração concluída com sucesso! ==="
echo "O projeto 'Aqui aceita Bitcoin?' está pronto para uso."
echo ""
echo "Para iniciar o desenvolvimento:"
echo "1. Edite os arquivos HTML, CSS e JS conforme necessário"
echo "2. Inicie um servidor local para testar as alterações"
echo "3. Use 'git add' e 'git commit' para salvar suas alterações"
echo ""
echo "Para mais informações, consulte a documentação em docs/"
