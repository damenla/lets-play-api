# Documento de Diseño: Autenticación y Seguridad (JWT)

## Resumen
Este documento describe la implementación del sistema de autenticación mediante JSON Web Tokens (JWT), la protección de rutas y el reforzamiento de la seguridad en la gestión de contraseñas.

## 1. Nuevos Endpoints de Autenticación

Se introducirá un nuevo controlador y rutas para gestionar la identidad y el acceso bajo el prefijo `/api/auth`:

| Método | Ruta | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Público | Registro de nuevos usuarios en el sistema. |
| `POST` | `/api/auth/login` | Público | Validación de credenciales y generación de token JWT. |

### Detalle de Login
- **Entrada**: `username` y `password`.
- **Salida (200 OK)**: Objeto conteniendo el `token` JWT generado.
- **Seguridad**: Si el usuario no existe o la contraseña no coincide, se devolverá un error genérico de "No autorizado" (401) para evitar enumeración de cuentas.

## 2. Gestión Segura de Contraseñas

Se garantiza que las contraseñas nunca se manejen en texto plano dentro de la persistencia:

- **Hashing**: Se utilizará una librería estándar (ej. `bcrypt`) para hashear las contraseñas con un factor de coste adecuado antes de guardarlas.
- **Puntos de Aplicación**:
    - Durante el proceso de **Registro** (`/api/auth/register`).
    - Durante la **Actualización de Contraseña** (`/api/users/:id/password`).
- **Validación**: Durante el login, se comparará el hash almacenado con el hash de la contraseña proporcionada.

## 3. Autorización mediante JWT

### Flujo de Trabajo
1. El cliente envía credenciales válidas a `/api/auth/login`.
2. El servidor firma un JWT que contiene el `id` del usuario como payload.
3. El cliente debe incluir este token en las peticiones subsiguientes usando el header: `Authorization: Bearer <TOKEN>`.

### Protección de Rutas
Se aplicará un middleware de autenticación global o selectivo con las siguientes excepciones:
- **Exclusiones (Abiertos)**: `/api/auth/register`, `/api/auth/login`.
- **Protegidos**: Todos los demás endpoints de la API (incluyendo toda la gestión bajo `/api/users/`).

## 4. Impacto en la Arquitectura

1. **Dependencias**: Se requiere añadir `jsonwebtoken` y `bcrypt`.
2. **Middleware**: Refactorización de `src/infrastructure/transport/middleware/auth.ts` para realizar la verificación real de la firma del token.
3. **Casos de Uso**: Creación de `LoginUseCase` y posible refactorización de `CreateUserUseCase` para asegurar el hasheo consistente.
