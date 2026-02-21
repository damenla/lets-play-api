# Comandos cURL para la API de Usuarios (Users)

## Variables de entorno iniciales

```bash
# URL de la API
export API_URL="http://localhost:3000"

# Se requiere un token obtenido mediante login (ver api-auth.md)
export AUTH_TOKEN="<TU_TOKEN_AQUÍ>"
export USER_ID="<ID_DEL_USUARIO>"
```

## 1. Obtener un usuario por ID (Protegido)

```bash
curl -i -X GET $API_URL/api/users/$USER_ID \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

**Respuesta esperada:** Status 200 OK con los datos del usuario.

## 2. Actualizar datos de usuario (Protegido)

```bash
curl -i -X PATCH $API_URL/api/users/$USER_ID \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "isActive": false
  }'
```

**Respuesta esperada:** Status 200 OK con el usuario actualizado.

## 3. Actualizar contraseña (Protegido)

```bash
curl -i -X PATCH $API_URL/api/users/$USER_ID/password \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "secretpassword123",
    "newPassword": "newsecurepassword456"
  }'
```

**Respuesta esperada:** Status 204 No Content.

## 4. Probar error de autorización (Token faltante)

```bash
curl -i -X GET $API_URL/api/users/$USER_ID
```

**Respuesta esperada:** Status 401 Unauthorized.
