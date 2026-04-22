# API Vehicle Testing Script
# Uso: Reemplaza {YOUR_TOKEN} con tu JWT token y {API_URL} con la URL de tu API

# Variables
API_URL="http://localhost:3000"
TOKEN="{YOUR_TOKEN}"

# ============================================
# 1. OBTENER VEHÍCULOS
# ============================================
echo "1. Obteniendo vehículos..."
curl -X GET \"$API_URL/users/me/vehicles\" \
  -H \"Authorization: Bearer $TOKEN\" \
  -H \"Content-Type: application/json\"

echo "\n\n"

# ============================================
# 2. AGREGAR VEHÍCULO
# ============================================
echo "2. Agregando vehículo..."
curl -X POST \"$API_URL/users/me/vehicles\" \
  -H \"Authorization: Bearer $TOKEN\" \
  -H \"Content-Type: application/json\" \
  -d '{
    \"brand\": \"Toyota\",
    \"model\": \"Corolla\",
    \"year\": 2020,
    \"plate\": \"ABC123\",
    \"type\": \"car\"
  }'

echo "\n\n"

# ============================================
# 3. ACTUALIZAR VEHÍCULO
# ============================================
echo "3. Actualizando vehículo (cambiar placa ABC123 a ABC124)..."
curl -X PUT \"$API_URL/users/me/vehicles/ABC123\" \
  -H \"Authorization: Bearer $TOKEN\" \
  -H \"Content-Type: application/json\" \
  -d '{
    \"brand\": \"Toyota\",
    \"model\": \"Corolla\",
    \"year\": 2021,
    \"plate\": \"ABC124\",
    \"type\": \"car\"
  }'

echo "\n\n"

# ============================================
# 4. ELIMINAR VEHÍCULO
# ============================================
echo \"4. Eliminando vehículo (placa ABC124)...\"
curl -X DELETE \"$API_URL/users/me/vehicles/ABC124\" \
  -H \"Authorization: Bearer $TOKEN\" \
  -H \"Content-Type: application/json\"

echo \"\\n\\nPruebas completadas.\"
