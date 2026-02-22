#!/bin/bash
# Requisitos: jq instalado
export API_URL="http://localhost:3000"
TS=$(date +%s)

# Helper para registrar y loguear
setup_user() {
    local name=$1
    local username="user_${name}_$TS"
    local email="${name}_$TS@test.com"
    local pass="password123"

    # 1. Registrar (Capturamos la salida para depurar si falla)
    local reg_res=$(curl -s -X POST $API_URL/api/auth/register \
      -H "Content-Type: application/json" \
      -d "{\"username\": \"$username\", \"name\": \"$name\", \"email\": \"$email\", \"password\": \"$pass\"}")
    
    # 2. Login
    local login_res=$(curl -s -X POST $API_URL/api/auth/login \
      -H "Content-Type: application/json" \
      -d "{\"username\": \"$username\", \"password\": \"$pass\"}")
    
    local token=$(echo $login_res | jq -r '.token')
    
    if [ "$token" == "null" ] || [ -z "$token" ]; then
        echo "ERROR: Fallo al obtener token para $username. Respuesta: $login_res" >&2
        return 1
    fi

    # 3. Obtener ID real desde /me
    local id=$(curl -s -X GET $API_URL/api/users/me -H "Authorization: Bearer $token" | jq -r '.id')
    
    if [ "$id" == "null" ] || [ -z "$id" ]; then
        echo "ERROR: Fallo al obtener ID para $username. Respuesta de /me: $id" >&2
        return 1
    fi

    echo "$token|$id"
}

echo "--- INICIANDO FLUJO DE GESTIÓN DE GRUPOS ---"

# Paso 1: Configurar usuarios
echo "\n1. Configurando usuarios (Dueño y Miembro)..."
U1_DATA=$(setup_user "Owner") || exit 1
U1_TOKEN=$(echo $U1_DATA | cut -d'|' -f1)
U1_ID=$(echo $U1_DATA | cut -d'|' -f2)

U2_DATA=$(setup_user "Guest") || exit 1
U2_TOKEN=$(echo $U2_DATA | cut -d'|' -f1)
U2_ID=$(echo $U2_DATA | cut -d'|' -f2)

echo "User 1 (Owner) ID: $U1_ID"
echo "User 2 (Guest) ID: $U2_ID"

# Paso 2: Crear grupo
echo "\n2. User 1 crea una agrupación..."
GROUP_RES=$(curl -s -X POST $API_URL/api/groups \
  -H "Authorization: Bearer $U1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Team Alpha $TS\", \"description\": \"El equipo original\"}")

GROUP_ID=$(echo $GROUP_RES | jq -r '.id')
if [ "$GROUP_ID" == "null" ]; then echo "Error al crear grupo: $GROUP_RES"; exit 1; fi
echo "Grupo creado: $(echo $GROUP_RES | jq -r '.name') (ID: $GROUP_ID)"

# Paso 3: Invitar
echo "\n3. User 1 invita a User 2..."
curl -s -X POST $API_URL/api/groups/$GROUP_ID/members \
  -H "Authorization: Bearer $U1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$U2_ID\"}" | jq '.'

# Paso 4: Aceptar
echo "\n4. User 2 acepta la invitación..."
curl -s -X PATCH $API_URL/api/groups/$GROUP_ID/invitations \
  -H "Authorization: Bearer $U2_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"status\": \"accepted\"}" | jq '.'

# Paso 5: Cambiar Rol
echo "\n5. User 1 promueve a User 2 a Manager..."
curl -s -X PATCH $API_URL/api/groups/$GROUP_ID/members/$U2_ID/role \
  -H "Authorization: Bearer $U1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"role\": \"manager\"}" | jq '.'

# Paso 6: Actualizar Metadatos
echo "\n6. User 1 actualiza metadatos del grupo..."
curl -s -X PATCH $API_URL/api/groups/$GROUP_ID \
  -H "Authorization: Bearer $U1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"description\": \"Descripción actualizada por el dueño\"}" | jq '.'

# Paso 7: Salir
echo "\n7. User 2 sale del grupo..."
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE $API_URL/api/groups/$GROUP_ID/members/me \
  -H "Authorization: Bearer $U2_TOKEN")
echo "HTTP Status: $STATUS_CODE (Esperado 204)"

# Paso 8: Desactivar
echo "\n8. User 1 desactiva el grupo..."
curl -s -X PATCH $API_URL/api/groups/$GROUP_ID \
  -H "Authorization: Bearer $U1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"isActive\": false}" | jq '.'

echo "\n--- FLUJO FINALIZADO ---"
