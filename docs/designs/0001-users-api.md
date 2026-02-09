# Diseño API - Gestión de Usuarios (Partidos de equipo)

## 1. Resumen de necesidades
- Guardar usuarios con un identificador único autogenerado.
- Almacenar email y datos básicos (p. ej. nombre/apodo).
- Prevenir usuarios duplicados con el mismo email (validación y restricción en BD).
- Mantener un estado que indique si un usuario está activo o no.

## 2. Modelo de datos (Usuario)
- id: UUID (autogenerado, p. ej. v4)
- email: string, único, requerido, formato RFC para emails
- name: string, opcional o requerido según negocio (campo básico)
- active: boolean (true = activo, false = inactivo). Valor por defecto: true
- createdAt: timestamp (autogenerado)

## 3. Validaciones y restricciones
- BD: índice único sobre el campo email para garantizar unicidad a nivel de persistencia.
- Servidor: validar formato de email y presencia de campos obligatorios.
- En caso de intentar crear usuario con email existente, devolver 409 Conflict.

## 4. Propuesta de endpoints (REST)

### 1. Crear usuario
**POST** `/api/v1/users`

#### Payload
```json
{
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez"
}
```

#### Responses
##### `201 Created`
```json
{
    "id": "b1a2c3d4-e5f6-7890-abcd-1234567890ef",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "active": true
}
```
##### `400 Bad Request` (validación)
##### `409 Conflict` (email duplicado)

### 2. Obtener datos de un usuario por id
**GET** `/api/v1/users/{id}`

#### Responses
##### `200 OK`
```json
{
    "id": "b1a2c3d4-e5f6-7890-abcd-1234567890ef",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "active": true
}
```
##### `404 Not Found`


### 3. Obtener datos de un usuario por email
**GET** `/api/v1/users?email={email}`

#### Responses
##### `200 OK`
```json
{
    "id": "b1a2c3d4-e5f6-7890-abcd-1234567890ef",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "active": true
}
```
##### `404 Not Found`

### 3. Actualizar campos básicos y/o estado (por ejemplo, activar/desactivar)
**PATCH** `/api/v1/users/{id}`

#### Payload:
```json
{
    "name": "Nuevo nombre",
    "email": "usuario_nuevo_email@ejemplo.com",
    "active": false
}
```

#### Responses
##### `200 OK`
```json
{
    "id": "b1a2c3d4-e5f6-7890-abcd-1234567890ef",
    "email": "usuario@ejemplo.com",
    "name": "Nuevo nombre",
    "active": false
}
```
##### `400 Bad Request` (validación)
##### `404 Not Found`
##### `409 Conflict` (email duplicado)




## 4. Notas de implementación (concisas)
- Generar id en la capa de persistencia o aplicación usando UUID v4.
- Implementar la restricción única en la base de datos para evitar condiciones de carrera.
- Considerar devolver un código de error específico (409) cuando el índice único falla por duplicado.
- Mantener la operación de eliminación como una simple actualización de active=false si se prefiere no borrar registros.

Limitación: El documento se circunscribe únicamente a las necesidades descritas (gestión básica de usuarios, unicidad de email y estado de actividad).
