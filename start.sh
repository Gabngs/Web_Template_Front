#!/bin/bash

# Script de inicio para gsp-front
# Clona, instala, verifica y levanta el proyecto Angular desde cero.

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

TOTAL_STEPS=7

step() { echo -e "${YELLOW}[$1/${TOTAL_STEPS}]${NC} $2"; }
ok()   { echo -e "${GREEN}✓ $1${NC}"; }
fail() { echo -e "${RED}✗ $1${NC}"; exit 1; }

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  GSP Front - Inicializador${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. Node.js
step 1 "Verificando Node.js..."
command -v node >/dev/null 2>&1 || fail "Node.js no está instalado. Instálalo desde https://nodejs.org/"
NODE_VERSION=$(node -v)
NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 20 ]; then
  fail "Node.js ${NODE_VERSION} es muy antiguo. Angular 21 requiere Node 20.19+, 22.12+ o 24+."
fi
ok "Node.js ${NODE_VERSION}"
echo ""

# 2. npm
step 2 "Verificando npm..."
command -v npm >/dev/null 2>&1 || fail "npm no está instalado (debería venir con Node.js)."
ok "npm $(npm -v)"
echo ""

# 3. Detectar node_modules corrupto (instalación interrumpida, antivirus, etc.)
step 3 "Verificando estado de node_modules..."
if [ -d "node_modules" ] && { [ ! -f "node_modules/typescript/lib/tsserver.js" ] || [ ! -d "node_modules/.bin" ]; }; then
  echo "  node_modules existe pero está incompleto o corrupto, se elimina para reinstalar limpio."
  rm -rf node_modules
fi
ok "Estado verificado"
echo ""

# 4. Instalar dependencias (npm ci si hay lockfile, con fallback a instalación limpia)
step 4 "Instalando dependencias..."
if [ -f "package-lock.json" ]; then
  if ! npm ci; then
    echo "  npm ci falló, reintentando con instalación limpia..."
    rm -rf node_modules
    npm install
  fi
else
  npm install
fi
ok "Dependencias instaladas"
echo ""

# 5. Regenerar rutas de dashboard-admin a partir de las carpetas existentes
#    (idempotente: si nada cambió en pages/dashboard-admin, no toca archivos).
step 5 "Regenerando rutas de dashboard-admin..."
node scripts/generate-routes.mjs
ok "Rutas sincronizadas con la estructura de carpetas"
echo ""

# 6. Verificación real de compilación (evita levantar el server con errores de TS/Angular)
step 6 "Verificando compilación TypeScript/Angular..."
rm -rf .angular/cache
if ! npx tsc --noEmit -p tsconfig.app.json; then
  fail "Hay errores de TypeScript en el proyecto. Revisa el output de arriba antes de continuar."
fi
ok "El proyecto compila sin errores"
echo ""

# 7. Levantar servidor de desarrollo
step 7 "Iniciando servidor de desarrollo..."
ok "Proyecto listo"
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Iniciando servidor Angular...${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

npm start
