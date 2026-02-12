# 01 - Design doc api users

Quiero generar una api REST para gestionar partidos de deportes en equipo. Tengo estos casos de uso:

1. Quiero poder guardar usuarios con un identificador único autogenerado.
2. El usuario debe almacenar un email y algún campo básico de información.
3. Quiero validar que no puedan existir usuarios duplicados con el mismo email.
4. Los usuarios pueden tener un estado para comprobar si están activos o no.

Quiero que me crees un documento de diseño en la carpeta docs/ en el que me definas de forma concisa las necesidades y propongas algunos endpoints que pueden ser necesarios.
Limitate a resolver las necesidades descritas.

# 02 - Add translations for descriptions

A partir de ahora, todo el texto que generes y sea descriptivio puedes hacerlo en castellano?

Y sobre el documento que acabas de generar, podrías modificar el texto descriptivo a castellano?

# 03 - Update user email

Me gustaría que también se pudiera actualizar el email del usuario

# 04 - Add error codes for validation

Y en los endpoints que sean necesario enviar un payload, que pueda devolver un código de error debido a la validación de datos.

# 05 - OpenAPI spec

Utiliza el design doc que acabas de escribir para definirme una especificación de OpenAPI.
Quiero documentar la api en Swagger, por lo que generame solamente el fichero de OpenAPI que luego yo pueda utilizar.

# 06 - Express server

Generame un fichero con un server en express con un GET para obtener el string 'hello world' para poder ver como ejecutar el server.
Hazlo en TypeScript.
Quiero poder ejecutarlo con TypeScript.

# 07 - Testing

Acabo de instalar vitest para implementar testing en la api.
Generame primero el comando en el package.json para ejecutar los test y un test dummy (con una suma sencilla)

# 08 - TDD

Empieza implementando los tests de la definicion en openapi (openapi.yaml) de mi api de usuarios.
Quiero primero los tests para luego implementar el servidor utilizando tdd.

# 09 - POST /api/users

Implementa el endpoint POST /api/users utilizando los tests como check para comprobar la implementacion.
Implementa la persistencia de momento en memoria porque luego ya implementaremos las distintas capas.
Puedes poner todo el código en el propio handler del endpoint.

# 10 - User interface

Implementa la interface de usuario en un fichero separado y luego importa el tipo en el handler.

## Fix - 01

Es correcta la carpeta donde has ubicado la interface o sería mejor otra?

# 11 - Refactor to 3 layers

Utilizando los tests que acabamos de generar, implementa un refactor para cambiar el código a 3 capas:

- transporte (todo lo que tiene que ver con express)
- dominio (todo lo que tiene que ver con reglas de negocio)
- persistencia (todo lo que tiene que ver con guardar los datos y bases de datos).
  Quiero que la capa de persistencia utilice el concepto de Repository y la capa de dominio utilice el concepto Use Case.

## Fix - 01

Me parece bien, propon una estructura de directorios para las capas

## Fix - 02

No me termina de convencer esa estructura.
Más adelante incluiré persistencia en algun tipo de base de datos.
Podrías sugerirme una estructura que vaya bien para clean architecture?

## Fix - 03

Estaba pensando en una estructura más parecida a esta:

```
src/
├── domain/
│   └── usecases/
│       └── createUserUseCase.ts
├── infrastructure/
│   ├── persistence/
│   │   └── userRepository.ts
│   └── transport/
│       ├── controllers/
│       │   └── userController.ts
│       └── routes/
│           └── userRoutes.ts
├── types/
│   └── user.ts
├── app.ts
├── server.ts
└── tests/
```

## Fix - XX

Varios prompts hasta conseguir la estructura de directorios que me gusta.

# 12 - GET /api/users

Implementa los tests que fallan relacionados con el endpoint GET /api/users/:id.
Asegurate que los tests relacionados con el endpoint GET /api/users/:id pasan correctamente.
Limitate a implementar lo necesario para el GET /api/users/:id, no hagas mas.

## Fix - 01 (Not used)

Update sin utilizar:
Implementa los tests que fallan relacionados con el endpoint GET /api/users/:id utilizando la misma estructura que ya has implementado para el POST.
Asegurate que los tests relacionados con el endpoint GET /api/users/:id pasan correctamente.
Limitate a implementar lo necesario para el GET /api/users/:id, no hagas mas.

# 13 - PATCH /api/users/:id

Implementa los tests que fallan relacionados con el endpoint PATCH /api/users/:id utilizando la misma estructura que ya has implementado para el POST.
Asegurate que los tests relacionados con el endpoint PATCH /api/users/:id pasan correctamente.
Limitate a implementar lo necesario para el PATCH /api/users/:id, no hagas mas.
