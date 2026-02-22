# Comandos cURL para la API de Usuarios (Users)

## Variables de entorno iniciales

```bash
# URL de la API
export API_URL="http://localhost:3000"

# Se requiere un token obtenido mediante login (ver api-auth.md)
export AUTH_TOKEN="<TU_TOKEN_AQUÍ>"
```

## 1. Obtener perfil del usuario autenticado (/me)

```bash
curl -i -X GET $API_URL/api/users/me \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

**Respuesta esperada:** Status 200 OK con los datos del usuario.

## 2. Actualizar datos del usuario autenticado (/me)

```bash
curl -i -X PATCH $API_URL/api/users/me \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "isActive": false
  }'
```

**Respuesta esperada:** Status 200 OK con el usuario actualizado.

## 3. Actualizar contraseña (/me/password)

```bash
curl -i -X PATCH $API_URL/api/users/me/password \
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
curl -i -X GET $API_URL/api/users/me
```

**Respuesta esperada:** Status 401 Unauthorized.
