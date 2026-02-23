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

# 40 - TDD - POST /api/groups

Quiero seguir la metodologia TDD.  
Quiero que empieces a crear los tests relacionados con la creación del grupo según lo definido en el documento de diseño 0004.  
Limítate a la creación de los tests.

## 1 - POST /api/groups logic

Comienza por ahí pero limitate a eso y me propones proximos pasos.

## Antes de continuar, crees que CreateGroupDto (src/types/group.ts) debería moverse a su caso de uso?

---

# 41 - TDD - GET /api/groups

Quiero seguir la metodologia TDD.  
Quiero que empieces a crear los tests relacionados con la obtención de grupos según lo definido en el documento de diseño 0004.  
Limítate a la creación de los tests.

## 1 - GET /api/groups logic

Implementa la lógica para los GET del enpdoint /api/groups según lo definido en el documento de diseño 0004.
Comienza por ahí pero limitate a eso y me propones proximos pasos.

# 42 - TDD - members management

Quiero seguir la metodologia TDD.  
Quiero que empieces a crear los tests relacionados con la gestión de miembros según lo definido en el documento de diseño 0004.  
Limítate a la creación de los tests.

## 1 inmplement members logic

Implementa la lógica para la gestión de miembros según lo definido en el documento de diseño 0004.
Comienza por ahí pero limitate a eso y me propones proximos pasos.

### Adjustments

- Recuerda, las validaciones deben ir en un método de validacion
- El estado de la invitacion para que pueda ser aceptada debe ser "invited"

# 43 - TDD - members management

Quiero seguir la metodologia TDD.  
Quiero que empieces a crear los tests relacionados con la gestión de miembros según lo definido en el documento de diseño 0004.  
Limítate a la creación de los tests.

Además:

- Solo el owner puede degradar roles, y solo el owner más antiguo activo puede degradar a otro owner.
- Un owner puede promocionar a un member a manager.
- Un owner puede promocionar a un manager a owner.
- Un manager intentando cambiar roles (debe fallar con 403).
- Un member intentando cambiar roles (debe fallar con 403).
- Impedir que el último owner se degrade a sí mismo a un rol inferior (regla de mínimo de propietarios).
- Validar roles inválidos.

## 1 inmplement members logic

Implementa la lógica para la gestión de miembros según lo definido en el documento de diseño 0004.
Comienza por ahí pero limitate a eso y me propones proximos pasos.

# 44 - TDD - members leave group

Quiero seguir la metodologia TDD.  
Quiero que empieces a crear los tests relacionados con la salida de miembros del grupo según lo definido en el documento de diseño 0004.  
Limítate a la creación de los tests.

## 1 inmplement leave group logic

Implementa la lógica para la salida de miembros del grupo según lo definido en el documento de diseño 0004.
Comienza por ahí pero limitate a eso y me propones proximos pasos.

# 45 - Fix security design errors

Acabo de darme cuenta de fallo de seguridad en el diseño actual.

Las peticiones que necesitan un userId, se le están pasando como parámetro en la URL y no lo está cogiendo del token, que si que lleva el userId del usuario autenticado.

Puedes revisarlo y proponerme los cambios necesarios?

# 46 - TDD disable/enable group

Quiero seguir la metodologia TDD.  
Quiero que empieces a crear los tests relacionados con la desactivación y reactivación de grupos según lo definido en el documento de diseño 0004.
Además, quiero que tengas en cuenta que un grupo solo puede ser desactivado por el owner activo más antiguo y puede ser reactivado por cualquier owner activo.
Limítate a la creación de los tests.

## Adjustmens

### 1

Quiero que revises en profundidad este test. Creo que no está bien. Tengo la impresión que las pruebas con distintos usuarios de mismo role no están bien.

### 2

Antes de ejecutar los tests, quiero que compruebes el resto de tests para que aplica esto que acabamos de ver. Tómate tu tiempo

### 3

Seguro que has restaurado todo lo antiguo. Creo que siguen faltando tests.

- Revisa toda las implementaciones que hay relacionados con los grupos y los miembros de los grupos.
- Ten en cuenta la Seniority
- Tomate tu tiempo, esto es un punto critico de la app.

## 1 implement disable/enable group logic

Implementa la lógica para la desactivación y reactivación de grupos según lo definido en el documento de diseño 0004.
Comienza por ahí pero limitate a eso y me propones proximos pasos.

# 47 - Check missing design

Antes de continuar, puedes comprobar si falta algo que esté definido en el documento de diseño 0004?

## 1 - Modify design

Si, pero quiero hacer unos cambios:

- name y description solo van a poder modificarlos los owners.
- el método para desactivar usuarios se ha implementado como eliminar usuario. No es necesario implementarlo. Quita las referencias en el diseño.

# 48 - PostgresGroupRepository

Implementa ahora la persistencia de los grupos en la base de datos así como las migraciones necesarias.

# 49 - Check openapi

Basándote en todo lo que ya ha implementado, puedes comprobar que esté recogido en el documento openapi.  
Tomate tu tiempo.

# 50 - Update documentation

Actualiza la documentación existente o crea la documentación técnica necesaria:

- Ejemplos de peticiones curl en la carpeta docs/curl/
- En la carpeta docs/curl/flows añade los flujos que faltan.

## Adjustments

- El script "group-management-flow.sh" no está funcionando. Revisalo

- Estoy ejecutando el comando "sh docs/curl/flows/group-management-flow.sh", parece que ha funcionado porque no devuelve error, pero cuando compruebo los datos en postgre no aparecen. Revisalo

# 51 - Design new feature: match organization

Quiero poder organizar partidos para distintos deportes de equipo.

Los partidos se organizan en torno a un grupo.

Los partidos tendrán como información:

- Fecha y hora. Requerido.
- Duración. Requerido. Formato "1h", "1h30m", "2h", etc.
- Número de jugadores. Requerido.
- Ubicación. Requerido.
- Deporte. En principio solo para futbol, pero quiero que el diseño sea escalable para poder añadir otros deportes en el futuro.
- Tendrá un estado: planificando, jugando, finalizado, cancelado.
- Color de los equipos. Requerido. Formato "#RRGGBB".

Solo los owners del grupo pueden organizar partidos, modificar la información del partido y su estado.

Podrán apuntarse / salirse del partido:

- miembros del grupo cuya membresía en el grupo sea activa
- mientras el estado del partido sea "planificando".

Quiero que si el número de miembros que se apuntan al partido es superior al número de jugadores, haya un sistema de méritos para decidir quiénes entran y quiénes se quedan fuera. Se me ocurre que pueda ser por número de partidos jugados dentro del grupo, pero estoy abierto a sugerencias.

Quiero que me crees un documento de diseño en la carpeta docs/ en el que me definas de forma concisa las necesidades y propongas algunos endpoints que pueden ser necesarios.
Limitate a resolver las necesidades descritas.

## Adjustments

### 1

Quiero realizar algunos ajustes.

Sobre la tabla matches:

- El campo team_colors, quiero que sean dos campos diferentes y solo almacenen el color en formato rgb.
- El campo sport no quiero que sea texto libre.
- El campo duration he pensado mejor que sea duración en minutos y sea de tipo numerico.

Sobre la tabla match_registrations:

- Me gustaría que de alguna forma se pudiera confirmar si realmente jugó el partido o falló a última hora, así como indicar quienes quedaron como reservas.
- Poder indicar si la actitud del jugador fue positiva o negativa.

Respecto al Sistema de méritos, quiero hacer algunas modificaciones:

En el grupo se crearán unas nuevas propiedades para:

- indicar el número de partidos que se tendrán en cuenta a la hora de calcular los criterios.
- puntos otorgados por partido jugados
- puntos otorgados por partido que debía jugar pero no apareció (pueden ser positivo o negativo)
- puntos otorgados por partido como reserva
- puntos otorgados por jugador negativo
- puntos otorgados por jugador positivo

Criterios:

- Criterio 1: Se contabilizarán los últimos X partidos disputados del grupo, y se sumaran los puntos definidos en el grupo
- Criterio 2: En caso de empate en los puntos, se ordenará por fecha en la que se apuntó al partido premiando a quien lo hiciera antes.

### 2

Quiero que implementes la lógica de los ajustes descritos en el punto anterior.

Quiero hacer algun ajuste más:

- Añadir un campo al partido para que una vez marcado, ya no se puedan realizar cambios ni en el partido ni en las valoraciones de los participantes.
- Creo que estaría bien un enpoint separado para poder evaluar a los participantes. Esta evaluación sólo se podrá hacer con el partido en estado finished, por los owners siempre que no esté bloqueado.
- Además otro endpoint especifico únicamente para hacer los cambios de estado del partido, validando desde que estados pueden pasar a otro.
- Y un endpoint para poder marcar el partido como no modificable.

### 3

Quiero añadir algun ajuste:

- Al obtener la lista de participantes, los méritos se calcularan hasta el partido actual sin tenerlo en cuenta
- Cuando el partido se pase a playing, se marcaran automaticamente los miembros que han quedado como reserva.
- Si algún miembro de los que estaban entre los participantes, se intenta quitar antes de X horas (nueva propiedad en grupo), se pasará al final de la lista de los participantes y esto afectará como mérito negativo en una nueva propiedad definida en el grupo.

# 52 - Update types and create tests

Actualiza los tipos y crea los tests.

Recuerda que estamos siguiendo metodologia TDD.

Tomate el tiempo necesario para crear unos tests robutos que prueben todos los escenarios definidos en el documento de diseño 0005.

Limitate a lo que te pido.

## Adjustments

### 1

Antes de continuar revisa detenidamente los tipos, Creo que no es correcto

### 2

Por favor, revisa el test que has generado y asegurate muy bien de que se cubren todos los escenarios definidos en el documento de diseño 0005.

No me importa que necesites más tiempo de lo normal, este punto es crítico.

# README.md

Este proyecto es mi TFM de un master que estoy realizando.

Como parte de la documentación del proyecto, te pido que me crees un README.md que contenga la siguiente información:

Documentación completa y detallada (README.md).
a. Descripción general del proyecto.
b. Stack tecnológico utilizado.
c. Información sobre su instalación y ejecución.
d. Estructura del proyecto.
e. Funcionalidades principales.

Actualmente ya existe un README.md, pero quiero que lo actualices para que contenga la información que se indica arriba.
Además, mira de que forma puedes incluir lo que ya existía en esta nueva versión.

## Adjustments

### 1

Quiero que analices en profundidad todas las variables de entorno que se utilizan en la app, y generes una sección en el README dedicada a las variables de entorno que utiliza la app y expliques para que se utilizan y las cosas que haya que tener en cuenta al definirlas. Tomate tu tiempo

### 2

- La variable JWT_EXPIRES_IN, es incorrecta tanto el nombre que has puesto como los valores permitidos y el por defecto.
- Actualiza las referencias que encontraste como "1h" o similar para que no haya confusion.

### 3

Hay una carpeta en el raiz (/docs) que contiene documentación. Analizala en profundida y proponme como añadirlo al reamde para que aporte valor. Tomate tu tiempo

### 4

Quiero que crees diagramas de lujo de mermaid para los procesos definidos, pero no los añadas de momento al readme.

### 5

Quiero que compruebes exhaustivamente cada uno de los diagramas mermaid que has creado, y te asegures al 100% que son fieles a lo implementado en la app.  
Tomate tu tiempo

### 6

Los colores del diagrama clean-architecture, son dificiles de ver y no se si el diagrama me termina de convencer. Puedes modificar los colores y el aspecto para darle un tono mas profesional

### 7

Crea un diagrama mermaid con el modelo de datos. Hazo de forma profesional. Tomate tu tiempo

### 8

Revisa el diagrama del modelo exhaustivaente para que sea 100% idéntico al modelo de la app. Creo que faltan campos. Tomate tu tiempo

### 9

Si tu fueras un progrmador que tienes que continuar el desarrollo del proyecto. Añade al readme información que falta y te fuera util.

### 10

Revisa de nuevo las variables de entorno que se utilizan en el proyecto y actualiza el fichero readme (solo la parte de variables de entorno). Hazlo Exhasutivamente. Tomate tu tiempo.

# 63 - License

El código se va a almacenar en un repositorio publico git. No se muy bien como funcionan las licencias en software. Podrías recomendarme alguna licencia que aunque el repo sea publico, no permita utilizar mi trabajo? Podrías inluirla en el proyecto como se suela hacer?
