# Comandos cURL para probar la API de Usuarios

## Variables de entorno

```bash
# Puerto por defecto (ajusta si usas otro)
export API_URL="http://localhost:3000"
```

## 1. Crear un nuevo usuario

```bash
curl -X POST $API_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jdoe",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "secretpassword123"
  }'
```

**Respuesta esperada:** Status 201, usuario creado con `id`, `username`, `name`, `email`, `isActive: true`, `createdAt`, `updatedAt`.

## 2. Crear otro usuario

```bash
curl -X POST $API_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jsmith",
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "password": "anotherpassword456"
  }'
```

## 3. Obtener un usuario específico por ID

```bash
# Primero guarda el ID de un usuario creado (copialo de la respuesta anterior)
export USER_ID="<ID_DE_TU_USUARIO>"

curl -X GET $API_URL/api/users/$USER_ID
```

**Nota:** Reemplaza `<ID_DE_TU_USUARIO>` con un ID real (UUID) obtenido al crear un usuario.

## 4. Actualizar un usuario por ID

```bash
# Usando el ID guardado anteriormente
curl -X PATCH $API_URL/api/users/$USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "isActive": false
  }'
```

**Respuesta esperada:** Status 200, usuario actualizado con los nuevos valores.

## 5. Actualizar solo el email (verificar conflictos)

```bash
curl -X PATCH $API_URL/api/users/$USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new.email@example.com"
  }'
```

## 6. Intentar actualizar con un email ya existente (debe fallar)

```bash
# Intenta actualizar el usuario 1 con el email del usuario 2
curl -X PATCH $API_URL/api/users/$USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@example.com"
  }'
```

**Respuesta esperada:** Status 409 Conflict.

## 7. Obtener usuario inexistente (debe fallar)

```bash
curl -X GET $API_URL/api/users/00000000-0000-0000-0000-000000000000
```

**Respuesta esperada:** Status 404 Not Found.

## 8. Actualizar contraseña de usuario

```bash
curl -X PATCH $API_URL/api/users/$USER_ID/password \
  -H "Content-Type: application/json" \
  -d '{
    "password": "newsecurepassword789"
  }'
```

**Respuesta esperada:** Status 204 No Content.

## 9. Acceder a ruta protegida (ejemplo)

```bash
# De momento la autenticación es un middleware mock que busca el header 'Authorization'
curl -X GET $API_URL/api/users/test/protected \
  -H "Authorization: Bearer mock-token"
```

**Respuesta esperada:** Status 200 OK con mensaje "Secret content".

---

## Flujo completo de prueba (con jq instalado)

```bash
export API_URL="http://localhost:3000"

# 1. Crear usuario
RESPONSE=$(curl -s -X POST $API_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "auto_user",
    "name": "Automatic User",
    "email": "auto@example.com",
    "password": "password123"
  }')

echo "Usuario creado:"
echo $RESPONSE | jq '.'

# 2. Extraer ID
USER_ID=$(echo $RESPONSE | jq -r '.id')
echo "ID: $USER_ID"

# 3. Consultar el usuario
echo -e "\nConsultando usuario..."
curl -s -X GET $API_URL/api/users/$USER_ID | jq '.'

# 4. Actualizar usuario
echo -e "\nActualizando usuario..."
curl -s -X PATCH $API_URL/api/users/$USER_ID \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}' | jq '.'

# 5. Actualizar contraseña
echo -e "\nActualizando contraseña..."
curl -s -v -X PATCH $API_URL/api/users/$USER_ID/password \
  -H "Content-Type: application/json" \
  -d '{"password": "newpassword"}'

# 6. Probar ruta protegida
echo -e "\nProbando ruta protegida..."
curl -s -X GET $API_URL/api/users/test/protected \
  -H "Authorization: Bearer mock-token" | jq '.'
```

**Nota:** Los comandos con `jq` requieren tener instalado `jq` para formatear el JSON. Si no lo tienes, elimina el `| jq '.'`
