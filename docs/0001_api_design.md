# Documento de Diseño de API - Gestión de Usuarios

## Resumen

Este documento describe el diseño del módulo de Gestión de Usuarios para la API de Partidos de Deportes en Equipo. El objetivo es almacenar información de usuarios, asegurar la integridad de los datos y gestionar el estado de los mismos.

## Modelo de Datos: Usuario

| Campo       | Tipo    | Descripción                                  | Restricciones       |
| :---------- | :------ | :------------------------------------------- | :------------------ |
| `id`        | UUID    | Identificador único del usuario.             | Autogenerado, PK    |
| `email`     | String  | Correo electrónico del usuario.              | Único, Requerido    |
| `name`      | String  | Nombre completo del usuario (info básica).   | Requerido           |
| `isActive`  | Boolean | Estado que indica si el usuario está activo. | Por defecto: `true` |
| `createdAt` | Date    | Fecha y hora de creación.                    | Autogenerado        |
| `updatedAt` | Date    | Fecha y hora de la última actualización.     | Auto-actualizado    |

## Requisitos Funcionales

1.  **Creación de Usuarios**:
    - A los usuarios se le debe asignar un identificador único y autogenerado al crearse.
2.  **Almacenamiento de Información**:
    - Se deben almacenar campos esenciales como Email y Nombre.
3.  **Validación**:
    - **Email Único**: El sistema debe verificar que no exista otro usuario con la misma dirección de correo antes de crear o actualizar.
4.  **Gestión de Estado y Actualización**:
    - Los usuarios deben tener un campo de estado (ej. `isActive`) para determinar si están activos actualmente en el sistema.
    - Se debe permitir la actualización de la información del usuario, incluyendo el email, asegurando que el nuevo email no pertenezca a otro usuario.

## Endpoints Propuestos

### 1. Crear Usuario

- **Método**: `POST`
- **Ruta**: `/api/users`
- **Cuerpo (Body)**:
    ```json
    {
        "email": "usuario@ejemplo.com",
        "name": "Juan Pérez"
    }
    ```
- **Respuesta (201 Created)**:
    ```json
    {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "usuario@ejemplo.com",
        "name": "Juan Pérez",
        "isActive": true,
        "createdAt": "2023-10-27T10:00:00Z"
    }
    ```
- **Error (400 Bad Request)**: Si los datos de entrada no son válidos (ej. email mal formado, falta nombre).
- **Error (409 Conflict)**: Si el email ya existe.

### 2. Obtener Detalles de Usuario

- **Método**: `GET`
- **Ruta**: `/api/users/:id`
- **Respuesta (200 OK)**: Devuelve el objeto usuario.
- **Error (404 Not Found)**: Si el ID de usuario no existe.

### 3. Actualizar Usuario

- **Método**: `PATCH`
- **Ruta**: `/api/users/:id`
- **Cuerpo (Body)**:
    ```json
    {
        "email": "nuevo.email@ejemplo.com", // Opcional
        "isActive": false, // Opcional
        "name": "Juan Pérez Actualizado" // Opcional
    }
    ```
- **Respuesta (200 OK)**: Devuelve el objeto usuario actualizado.
- **Error (400 Bad Request)**: Si los datos de entrada no son válidos (ej. email mal formado).
- **Error (409 Conflict)**: Si el nuevo email ya existe en otro usuario.
