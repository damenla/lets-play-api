# Comandos cURL para la API de Autenticación (Auth)

## Variables de entorno iniciales

```bash
# URL de la API
export API_URL="http://localhost:3000"
```

## 1. Registrar un nuevo usuario (Público)

```bash
curl -i -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jdoe",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "secretpassword123"
  }'
```

**Respuesta esperada:** Status 201 Created. El cuerpo contiene el objeto `User` (sin la contraseña).

## 2. Iniciar sesión para obtener Token JWT (Público)

```bash
curl -i -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jdoe",
    "password": "secretpassword123"
  }'
```

**Respuesta esperada:** Status 200 OK. El cuerpo contiene `{"token": "eyJhbG..."}`.

## 3. Probar error de validación (Email inválido)

```bash
curl -i -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "baduser",
    "name": "Bad User",
    "email": "not-an-email",
    "password": "password123"
  }'
```

**Respuesta esperada:** Status 400 Bad Request con el código `INVALID_EMAIL_FORMAT`.
