#!/bin/bash
export API_URL="http://localhost:3000"
UNIQUE_SUFFIX=$(date +%s)
USERNAME="tester_$UNIQUE_SUFFIX"

echo "\n1. Registrando usuario ($USERNAME)..."
REG_RES=$(curl -s -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"name\": \"Test User\",
    \"email\": \"test_$UNIQUE_SUFFIX@example.com\",
    \"password\": \"password123\"
  }")

USER_ID=$(echo $REG_RES | jq -r '.id')

if [ "$USER_ID" == "null" ] || [ -z "$USER_ID" ]; then
    echo "Error al registrar: $REG_RES"
    exit 1
fi
echo "User ID: $USER_ID"

echo "\n2. Iniciando sesión..."
LOGIN_RES=$(curl -s -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{ \"username\": \"$USERNAME\", \"password\": \"password123\" }")

TOKEN=$(echo $LOGIN_RES | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo "Error al iniciar sesión: $LOGIN_RES"
    exit 1
fi
echo "Token obtenido con éxito."

echo "\n3. Consultando datos (Ruta protegida)..."
curl -s -X GET $API_URL/api/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo "\n4. Actualizando nombre..."
curl -s -X PATCH $API_URL/api/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Tester Updated"}' | jq '.'

echo "\n5. Actualizando contraseña..."
PWD_RES=$(curl -i -s -X PATCH $API_URL/api/users/$USER_ID/password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword": "password123", "newPassword": "newpassword456"}')

if echo "$PWD_RES" | grep -q "204"; then
    echo "Contraseña actualizada (HTTP 204 OK)"
else
    echo "Error al actualizar contraseña:"
    echo "$PWD_RES"
fi