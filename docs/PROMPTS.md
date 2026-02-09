# 01 - Design doc api users

Quiero generar una api REST para gestionar partidos de deportes en equipo. Tengo estos casos de uso:
1. Quiero poder guardar usuarios con un identificador único autogenerado.
1. El usuario debe almacenar un email y algún campo básico de información.
1. Quiero validar que no puedan existir usuarios duplicados con el mismo email.
1. Los usuarios pueden tener un estado para comprobar si están activos o no.

Quiero que me crees un documento de diseño en la carpeta docs/ en el que me definas de forma concisa las necesidades y propongas algunos endpoints que pueden ser necesarios.
Limitate a resolver las necesidades descritas.

# 02
## A
Puedes añadir al documento de diseño generado ejemplos de los json para cada uno de los endpoints

## B
Puedes añadir un .gitignore standard para proyectos node con TypeScript

## C
Puedes modificar el fichero de diseño para que los ejemplos de json aparezcan remarcados como markdown

# 03
## A
Generame un fichero con un server en express con un GET para obtener el string 'hello world' para poder ver como ejecutar el server.
Hazlo en TypeScript.
Quiero poder ejecutarlo con TypeScript.

## B
puedes deshacer el último commit sin perder los cambios?

## C
Acabo de instalar vitest para implementar testing en la api.
Generame primero el comando en el package.json para ejecutar los test y un test dummy (con una suma sencilla)

# 04
## A
Utiliza el design doc que acabas de crear para definirme una especificación OpenAPI.
Quiero documentar la api en Swagger, por lo que genera solo el fichero de OpenAPI que yo luego pueda utilizar.

## B
Validala con Swagger Editor

## C
El fichero generao me parece correcto.
Sólo quiero que lo hagas más genérico ya que en un futuro tendremos más apis y estarán incluidas en este fichero y lo pongas en el raiz de docs

## D
Empieza implementando los tests de la definicion en openapi (openapi.yaml) de mi api de usuarios. Quiero primero los tests para luego implementar el servidor utilizando tdd.

## E
Disculpa no entendi bien el paso anterior.
No quiero que compruebes el fichero openapi en si, revierte los cambios.
Pero si que quiero que crees las pruebas de integración para los endpoints de users definidos en openapi.yaml.

## F
Puedes añadir createApp() a server.ts? Pero en vez de hacerlo directamente en ese fichero, creao un app.ts y modifica server.ts para que lo utilice

## G
He revertido algunos de tus cambios porque no eran lo que quería y te vuelvo a hacer una nueva petición.
Empieza implementando los tests de la definicion en openapi (openapi.yaml) de mi API de usuarios.
No quiero tests para validar el fichero openapi en sí, solo los endpoints.
Quiero primero los tests para luego implemente el servidor utilizando TDD.

## H
Quiero que el createApp se inicialize cada vez que se ejecute un test

## I
Quiero un describe por cada endpoint

## J
He actualizado los endpoints.
Puedes actualizar el test?

## K
Si

## L
El test no está actualizado con los endpoints modificados

## M
Sincronizalos con openapi.yml

## N
Lo que has hecho parece que está bien, pero me refiero a que he modificado los endpoints.
Puedes modificar los tests para que apunten a los nuevos endpoints

## O
Disculpa fallo mio.
No he actualizado openapi.yaml, he actualizado el fichero de diseño.
Puedes actualizar openapi.yaml para que refleje lo definido el fichero de diseño?

## P
Si

## Q
Si
