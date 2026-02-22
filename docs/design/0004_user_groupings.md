# Diseño de Agrupaciones de Usuarios

## 1. Introducción
Este documento describe el diseño para permitir a los usuarios crear grupos, invitar a otros miembros y gestionar su pertenencia.

## 2. Modelo de Datos

### Tabla: `groups`
Representa una agrupación creada por un usuario.
- `id`: UUID (Primary Key)
- `name`: VARCHAR(255) (Unique, Required)
- `description`: TEXT (Optional)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### Tabla: `group_members`
Tabla asociativa para la relación muchos-a-muchos entre usuarios y grupos, con metadatos de membresía.
- `group_id`: UUID (Foreign Key -> `groups.id`)
- `user_id`: UUID (Foreign Key -> `users.id`)
- `status`: ENUM ('invited', 'accepted', 'rejected')
- `role`: ENUM ('owner', 'manager', 'member')
- `status_updated_at`: TIMESTAMP (Fecha del último cambio de estado)
- `created_at`: TIMESTAMP (Fecha de creación del registro/invitación)
- `updated_at`: TIMESTAMP (Fecha de la última modificación del registro)
- `Primary Key`: (`group_id`, `user_id`)

## 3. Reglas de Negocio

### Creación
- Cualquier usuario autenticado y activo puede crear una agrupación.
- El creador se registra automáticamente en `group_members` con `status='accepted'` y `role='owner'`, convirtiéndose en el primer propietario.

### Roles y Permisos
- **Propietario (Owner)**: Fuente de verdad para la propiedad del grupo. Tiene control total, incluyendo la capacidad de desactivar el grupo, cambiar metadatos (nombre, descripción), y gestionar gestores u otros propietarios.
- **Gestores (Manager)**: Pueden invitar miembros y gestionar el estado de miembros existentes (excepto propietarios). No pueden editar información básica del grupo.
- **Miembro (Member)**: Participante activo sin permisos de gestión.

### Regla de Mínimo de Propietarios
- Una agrupación debe tener **siempre al menos un propietario activo**.
- No se permitirá que el último propietario activo abandone el grupo o cambie su rol a uno inferior sin haber nombrado a otro propietario activo previamente.

### Invitaciones
- Solo los usuarios con rol `owner` o `manager` dentro de un grupo pueden invitar a otros usuarios.
- Al invitar, el registro en `group_members` se crea con `status='invited'` y `role='member'` por defecto.
- Solo los usuarios con rol `owner`podrán nombrar a otros usuarios como `manager`.

### Gestión de Invitaciones
- Un usuario invitado puede cambiar su estado a `accepted` o `rejected`.
- Solo el propio usuario puede aceptar/rechazar su invitación.
- Una vez aceptada, el usuario pasa a ser un miembro activo del grupo.

## 4. API Endpoints

### Agrupaciones
- `POST /api/groups`: Crear una nueva agrupación.
- `GET /api/groups`: Listar agrupaciones (donde soy miembro o dueño).
- `GET /api/groups/{id}`: Obtener detalle de una agrupación.

### Miembros e Invitaciones
- `POST /api/groups/{id}/members`: Invitar a un usuario al grupo (Solo Dueño/Gestor).
- `PATCH /api/groups/{id}/invitations`: Aceptar o rechazar una invitación (Solo el invitado).
- `GET /api/groups/{id}/members`: Listar miembros y su estado.

## 5. Consideraciones de Seguridad
- Se debe validar que el usuario que realiza acciones protegidas (invitar, editar grupo) tenga los permisos adecuados.
- Un usuario inactivo no puede crear grupos ni ser invitado.
- La unicidad del nombre del grupo se validará a nivel de base de datos y en el caso de uso.
