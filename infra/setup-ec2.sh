#!/bin/bash
# Script de setup para EC2 - Instala Docker e prepara ambiente

set -e

echo "🚀 Iniciando setup do KitCerto no EC2..."

# Atualizar sistema
echo "📦 Atualizando pacotes..."
sudo apt-get update
sudo apt-get upgrade -y

# Instalar dependências
echo "📦 Instalando dependências..."
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git

# Instalar Docker
echo "🐳 Instalando Docker..."
if ! command -v docker &> /dev/null; then
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker $USER
    echo "✅ Docker instalado!"
else
    echo "✅ Docker já instalado!"
fi

# Instalar Docker Compose (standalone se necessário)
if ! command -v docker compose &> /dev/null; then
    echo "📦 Instalando Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose instalado!"
else
    echo "✅ Docker Compose já instalado!"
fi

# Verificar instalação
echo "🔍 Verificando instalações..."
docker --version
docker compose version

echo ""
echo "✅ Setup concluído!"
echo ""
echo "📝 Próximos passos:"
echo "1. Faça logout e login novamente (ou execute: newgrp docker)"
echo "2. Clone o repositório: git clone <seu-repo>"
echo "3. Entre na pasta infra: cd KitCerto/infra"
echo "4. Crie o arquivo .env com as variáveis de ambiente"
echo "5. Execute: docker compose -f docker-compose.prod.yml --env-file .env up -d"
