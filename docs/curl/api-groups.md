# Comandos cURL para la API de Agrupaciones (Groups)

## Variables de entorno iniciales

```bash
# URL de la API
export API_URL="http://localhost:3000"

# Se requiere un token obtenido mediante login (ver api-auth.md)
export AUTH_TOKEN="<TU_TOKEN_AQUÍ>"
export GROUP_ID="<ID_DEL_GRUPO>"
export USER_ID="<ID_DEL_USUARIO_A_INVITAR_O_MODIFICAR>"
```

## 1. Crear una nueva agrupación (Protegido)

```bash
curl -i -X POST $API_URL/api/groups 
  -H "Authorization: Bearer $AUTH_TOKEN" 
  -H "Content-Type: application/json" 
  -d '{
    "name": "Equipo de Fútbol",
    "description": "Amigos del barrio para jugar los jueves"
  }'
```

**Respuesta esperada:** Status 201 Created con el objeto `Group`.

## 2. Listar mis agrupaciones (Protegido)

```bash
curl -i -X GET $API_URL/api/groups 
  -H "Authorization: Bearer $AUTH_TOKEN"
```

**Respuesta esperada:** Status 200 OK con un array de grupos.

## 3. Obtener detalle de una agrupación (Protegido - Solo miembros)

```bash
curl -i -X GET $API_URL/api/groups/$GROUP_ID 
  -H "Authorization: Bearer $AUTH_TOKEN"
```

**Respuesta esperada:** Status 200 OK con los detalles del grupo.

## 4. Actualizar metadatos o estado del grupo (Protegido - Solo Owners)

```bash
curl -i -X PATCH $API_URL/api/groups/$GROUP_ID 
  -H "Authorization: Bearer $AUTH_TOKEN" 
  -H "Content-Type: application/json" 
  -d '{
    "name": "Equipo de Fútbol Real",
    "description": "Nueva descripción",
    "isActive": false
  }'
```

**Respuesta esperada:** Status 200 OK con el grupo actualizado.

## 5. Listar miembros de un grupo (Protegido - Solo miembros)

```bash
curl -i -X GET $API_URL/api/groups/$GROUP_ID/members 
  -H "Authorization: Bearer $AUTH_TOKEN"
```

**Respuesta esperada:** Status 200 OK con un array de `GroupMember`.

## 6. Invitar a un nuevo miembro (Protegido - Solo Owners/Managers)

```bash
curl -i -X POST $API_URL/api/groups/$GROUP_ID/members 
  -H "Authorization: Bearer $AUTH_TOKEN" 
  -H "Content-Type: application/json" 
  -d '{
    "userId": "'"$USER_ID"'"
  }'
```

**Respuesta esperada:** Status 201 Created con el registro de invitación.

## 7. Gestionar mi propia invitación (Protegido)

```bash
curl -i -X PATCH $API_URL/api/groups/$GROUP_ID/invitations 
  -H "Authorization: Bearer $AUTH_TOKEN" 
  -H "Content-Type: application/json" 
  -d '{
    "status": "accepted"
  }'
```

**Nota:** El `status` puede ser `accepted` o `rejected`.

## 8. Cambiar rol de un miembro (Protegido - Solo Owners)

```bash
curl -i -X PATCH $API_URL/api/groups/$GROUP_ID/members/$USER_ID/role 
  -H "Authorization: Bearer $AUTH_TOKEN" 
  -H "Content-Type: application/json" 
  -d '{
    "role": "manager"
  }'
```

**Nota:** Requiere que el solicitante sea el `owner` más antiguo activo si se intenta degradar a otro `owner`.

## 9. Salir del grupo (Protegido)

```bash
curl -i -X DELETE $API_URL/api/groups/$GROUP_ID/members/me 
  -H "Authorization: Bearer $AUTH_TOKEN"
```

**Respuesta esperada:** Status 204 No Content.
