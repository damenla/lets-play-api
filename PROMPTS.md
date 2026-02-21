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

# 14 - Middleware logger

Quiero implementar en mi backend un middleware de express para hacer logs de las peticiones que recibe el servidor.
Limitate a implementar lo necesario para el middleware, no hagas mas.

# 15 - Middleware auth

Añade un endpoint de prueba que esté protegido detrás de autentificación. Hazlo sencillo, que requiera un token hardcodeado, y genera un middleware que verifique el token.

# 16 - Tests auth

Genera una suite de tests para validar el middleware de autentificación

# 17 - Persistence

Quiero realizar una nueva implementacion de la capa de persistencia (Repositories).
Ahora tengo la persistencia en memoria pero me gustaria tener los datos en una base de datos PostgreSQL.
Primero, realiza el setup de las dependencias necesarias y luego hacemos la implementacion especifica.

# 18 - Docker compose

Generame un fichero docker compose para levantar un postgresql con las variables de entorno definidas en .env.example para que pueda ejecutar mi servidor contra esa bd

# 19 - Dockerfile

Generame un Dockerfile para que yo pueda generar imagenes de mi servidor.
La idea es que pueda desplegarlo allá donde Docker sea compatible.

# 20 - User model modifications

Quiero realizar las siguiente modificaciones en el usuario:

1. Añadir un campo de nombre de usuario, obligatorio y único.
2. El email deja de ser único.
3. Añadir un campo para almacenar el password del usuario.

Generame un documento de diseño en la carpeta docs/design/ que describa de forma concisa estos cambios.

# 21 - OpenAPI spec

Utiliza el design doc que acabas de generar (docs/design/0002\_...) para actualizar la especificación de OpenAPI.

# 22 - Update TDD

Actualiza los tests relacionados con las modificaciones introducidas en la especificación de OpenAPI.

# 23 - Auth

Quiero realizar las siguiente modificaciones relacionadas con el usuario:

1. Añadir dos nuevos endpoints para permitir el registro de un nuevo usuario y el login de un usuario.
2. Cuando un usuario se registre o actualice su password, este debe ser hasheado de forma segura.
3. Cuando un usuario se loguee, se debe generar un token JWT que se debe enviar al cliente y será necesario utilizarlo para acceder a los endpoints protegidos.
4. Quiero que se protejan todos los endpoints excepto el de registro de usuarios y el de login.

Generame un documento de diseño en la carpeta docs/design/ que describa de forma concisa estos cambios.

# 24 - OpenAPI spec

Utiliza el design doc que acabas de generar (docs/design/0003\_...) para actualizar la especificación de OpenAPI.

# 25 - Update TDD

Actualiza los tests relacionados con las modificaciones introducidas en la especificación de OpenAPI.

# 26 - TDD Password hash tests

Basandote en el design doc 0003_auth.md, implementa los tests relacionados con la generación y validación del hash del password del usuario.

# 27 - Password hash logic

Implementa los tests relacionados con la generación y validación del hash del password del usuario.

# 28 - TDD JWT tests

Basándote en el design doc 0003_auth.md, implementa los tests para la lógica de generación de tokens JWT y la validación de los mismos.

El token debe contener el id del usuario, el username y la fecha de expiración.
Los tokens deben tener una caducidad de 5 minutos, y debe ser configurable mediante variables de entorno.

# 29 - JWT logic

Implementa la lógica relacionada con la generación y validación del token JWT.
Y modifica el código para que llame a esta nueva implementación.
Revisa que todo funcione correctamente y los tests pasan.

# 30 - Refactor - Use Cases Validation

En los casos de uso del proyecto, hay algunos que la validacion de los datos de entrada se hacen en nu método separado y en otros en el mismo método de ejecución.  
Unifcalo todos para que llamen a un método de validación.

# 31 - Refactor - Format validation

En la aplicación hay validadores de formatos como por ejemplo: uuid, email, ...  
Puedes identificarlos y proponerme una solución para no tener código duplicado?

# 32 - Fix - Auth

Creo que si intentas crear un usuario devuelve error indicando que no existe el token, en este punto no puede existir token.
Puedes revisarlo?

## Fix - 01

Tienes razón, no tiene sentido mantener esas dos rutas.
Para la creación de un usuario nos vamos a quetar solo con la de register.

# 33 - Update curl examples

Actualiza el fichero curl de ejemplos para que tenga en cuenta el funcionamiento actual de la api rest

## Fix - 01

He realizado una prueba creando un usuario y ha sido ok, y cuando he intentado hacer login con dicho usuario ha devuelto un error 500.
Puedes revisarlo?

## Fix - 02

Puedes revisar las variables de entorno que se utilizan en la app y comprobar que estén en el fichero .env y .env.example?

## Fix - 03

El "Script de prueba automatizado (requiere jq)" no me ha funcionado.  
Puedes revisarlo?

# 34 - Refactor - curl examples

Separa el fichero docs/curl en varios ficheros:

- api-users: contendrá lo relacionado al enpoint users
- api-auth: ejemplos relacionados al enpoint auth
- y Crea una carpeta para la ejecución de flows completos y añade ahí el script.

# 35 - Fix - Login

Cuando el usuario hace login, quiero comprobar que el usuario esté activo o no.

# 36 - TDD - Auth

Implementa un test que compruebe que un usuario con un token válido, no pueda acceder si el usuario está inactivo. Solo implemente el testo, quiero utilizar metodlogia TDD.

# 37 - Auth logic improvement

Implementa la lógica necesaria para que el test anterior pase.

# 38 - Group

Quiero poder tener una agrupacion de usuarios.

- Dicha agrupación tendrá un nombre, una descripción y un propietario.
    - El propietario será el usuario que la cree.
    - El nombre será único.
    - La descripción será opcional.

- Un usuario puede pertenecer a varias agrupaciones y una agrupación puede tener varios usuarios.
- Un usuario puede ser propietario de varias agrupaciones.

- Un usuario autenticado puede crear agrupaciones.

- Los usuarios de la agrupación:
    - Tendrán uno de los siguientes estados: invitado, aceptado, rechazado o inhabilitado.
    - Tendrán la fecha en la que se hizo el último cambio de estado.
    - Tendrán un rol: gestor o miembro.

- El propietario del grupo o los getores del grupo podrán invitar a otros usuarios a pertenecer a su agrupación.

- Un usuario invitado puede aceptar o rechazar la invitación.

Genera un documento de diseño en la carpeta docs/design/ que describa de forma concisa estos cambios.

## Fix 01

Respecto al documento generado, tiene sentido almacenar en el grupo el owner ? ya que vamos a utilizar la tabla de invitaciones para detectar los owners?

# 39 - new migration

Implementa la migración SQL necesarias según el documento de diseño 0004 basandote en las migraciones ya definidas en el proyecto

## Fix 01

- Modifica el documento de diseño y tu propuesta para que la tabla de miembros también contemple la fecha de creación y la fecha de la última actualización
