# Documento de Diseño: Mejoras en el Modelo de Usuario

## Resumen
Este documento describe las modificaciones al modelo de usuario para incluir un nombre de usuario único, contraseña y permitir duplicidad de correos electrónicos.

## Cambios en el Modelo de Datos

| Campo      | Tipo   | Restricciones Actuales | Nuevas Restricciones  | Descripción                                      |
| :--------- | :----- | :--------------------- | :-------------------- | :----------------------------------------------- |
| `username` | String | *No existe*            | **Único, Requerido**  | Nuevo identificador único del usuario.           |
| `email`    | String | Único, Requerido       | **No único**, Requerido | Correo electrónico de contacto.                  |
| `password` | String | *No existe*            | **Requerido**         | Contraseña del usuario (almacenada como hash).   |

## Implicaciones

1.  **Registro de Usuarios**:
    -   Se añade `username` como campo obligatorio.
    -   Se añade `password` como campo obligatorio.
    -   Se valida que `username` no exista.
    -   **No** se valida la unicidad del `email`.

2.  **Autenticación**:
    -   El login principal se realizará mediante `username` y `password`.

3.  **Seguridad**:
    -   La contraseña debe almacenarse hasheada (ej. bcrypt/argon2).
