#!/bin/bash

# Script de inicio para Web Template Front
# Este script configura e inicializa el proyecto Angular

set -e  # Detener si hay errores

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Web Template Front — Inicializador${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Verificar Node.js
echo -e "${YELLOW}[1/4]${NC} Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js no está instalado${NC}"
    echo "Por favor, instala Node.js desde: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION} encontrado${NC}"
echo ""

# Verificar npm
echo -e "${YELLOW}[2/4]${NC} Verificando npm..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm no está instalado${NC}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm ${NPM_VERSION} encontrado${NC}"
echo ""

# Instalar dependencias
echo -e "${YELLOW}[3/4]${NC} Instalando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "Instalando por primera vez..."
    npm install
else
    echo "Verificando dependencias..."
    npm install --no-audit
fi
echo -e "${GREEN}✓ Dependencias instaladas${NC}"
echo ""

# Iniciar servidor de desarrollo
echo -e "${YELLOW}[4/4]${NC} Iniciando servidor de desarrollo..."
echo -e "${GREEN}✓ Proyecto listo${NC}"
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Iniciando servidor Angular...${NC}"
echo -e "${BLUE}  http://localhost:4200${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

npm start
