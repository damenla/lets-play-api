# Let's Play API - Sistema de Gestión de Partidos Amateurs

Este proyecto constituye el **Trabajo de Fin de Máster (TFM)** para la gestión automatizada de partidos de deportes colectivos. La aplicación permite a los usuarios organizar grupos, convocar partidos, gestionar inscripciones y automatizar la logística de eventos deportivos.

---

## 1. Descripción General

**Let's Play API** es una solución robusta diseñada para resolver la fragmentación en la organización de deportes amateurs. El sistema centraliza la comunicación de grupos, la disponibilidad de plazas en partidos y el seguimiento de participantes.

### Objetivos del Proyecto:

- **Automatización**: Eliminar la gestión manual de listas de espera y confirmaciones.
- **Escalabilidad**: Arquitectura orientada a soportar múltiples grupos y deportes.
- **Seguridad**: Implementación de estándares de industria para autenticación y autorización.
- **Portabilidad**: Diseño basado en contenedores para un despliegue ágil en entornos Cloud.

---

## 2. Stack Tecnológico

El proyecto emplea tecnologías de vanguardia enfocadas en el rendimiento y la mantenibilidad:

- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) (Tipado estático para mayor robustez).
- **Runtime**: [Node.js](https://nodejs.org/) v20+ / v24+.
- **Framework Web**: [Express.js](https://expressjs.com/) (Arquitectura de middleware).
- **Base de Datos**: [PostgreSQL](https://www.postgresql.org/) (Persistencia relacional).
- **Infraestructura**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/).
- **Seguridad**: JWT (JSON Web Tokens) y Bcrypt para hashing de contraseñas.
- **Despliegue (PoC)**: Compatible con Render, Koyeb y Supabase (Postgres Managed).

---

## 3. Configuración de Variables de Entorno

La aplicación utiliza variables de entorno para gestionar su comportamiento en diferentes entornos (Desarrollo, Test, Producción). Estas deben definirse en un archivo `.env` en la raíz del proyecto.

### Configuración del Servidor

| Variable   | Descripción                                                                                                                     | Valor por Defecto |
| :--------- | :------------------------------------------------------------------------------------------------------------------------------ | :---------------- |
| `PORT`     | Puerto HTTP donde escuchará el servidor.                                                                                        | `3000`            |
| `NODE_ENV` | Entorno de ejecución (`development`, `production`). En `production` se activa forzosamente el uso de SSL para la base de datos. | `development`     |

### Persistencia y Base de Datos

La aplicación soporta dos modos de persistencia.

#### Modo In-Memory

En este modo, la aplicación no utiliza una base de datos externa y todo el estado se mantiene en memoria volátil. Este modo es ideal para pruebas rápidas o demos sin infraestructura.

| Variable         | Descripción                                                                      | Valor por Defecto |
| :--------------- | :------------------------------------------------------------------------------- | :---------------- |
| `IN_MEMORY_DATA` | Si se establece en `true`, la app ignora la base de datos y usa memoria volátil. | `false`           |

#### Modo PostgreSQL

En este modo, la aplicación utiliza una base de datos PostgreSQL para persistir los datos.

La variable `DATABASE_URL` tiene prioridad si está definida.

**Opción A: Connection String (Recomendada para Cloud)**

| Variable       | Descripción                            | Ejemplo                             |
| :------------- | :------------------------------------- | :---------------------------------- |
| `DATABASE_URL` | URL completa de conexión a PostgreSQL. | `postgres://user:pass@host:5432/db` |

**Opción B: Parámetros Individuales**

| Variable      | Descripción                         | Valor por Defecto |
| :------------ | :---------------------------------- | :---------------- |
| `DB_HOST`     | Host del servidor de base de datos. | -                 |
| `DB_PORT`     | Puerto de conexión.                 | `5432`            |
| `DB_NAME`     | Nombre de la base de datos.         | -                 |
| `DB_USER`     | Usuario de la base de datos.        | -                 |
| `DB_PASSWORD` | Contraseña del usuario.             | -                 |

**Configuración Avanzada del Pool**

| Variable                | Descripción                                                        | Valor por Defecto |
| :---------------------- | :----------------------------------------------------------------- | :---------------- |
| `DB_POOL_MAX`           | Número máximo de clientes en el pool de conexiones.                | `10`              |
| `DB_IDLE_TIMEOUT`       | Tiempo (ms) que un cliente puede estar inactivo antes de cerrarse. | `10000` (10s)     |
| `DB_CONNECTION_TIMEOUT` | Tiempo máximo (ms) para esperar una conexión antes de fallar.      | `2000` (2s)       |

### Seguridad (Autenticación)

| Variable                 | Descripción                                            | Importancia                                                       |
| :----------------------- | :----------------------------------------------------- | :---------------------------------------------------------------- |
| `JWT_SECRET`             | Clave secreta para firmar los tokens de sesión.        | **CRÍTICA**. Debe ser una cadena larga y compleja en producción.  |
| `JWT_EXPIRATION_SECONDS` | Tiempo de validez del token expresado en **segundos**. | Por defecto `300` (5 minutos). Controla la duración de la sesión. |

---

## 4. Instalación y Ejecución

### Requisitos Previos

- Docker y Docker Compose instalados.
- Node.js (opcional, para desarrollo local sin contenedores).

### Configuración del Entorno

Crea un archivo `.env` en la raíz del proyecto basado en `.env.example`:

```bash
cp .env.example .env
```

### Ejecución con Docker (Recomendado)

Para levantar el ecosistema completo (API + PostgreSQL):

```bash
docker-compose up -d
```

- **API**: `http://localhost:3000`
- **DB**: Puerto `5432`

### Desarrollo Local

1. Instalar dependencias: `npm install`
2. Iniciar solo la DB: `docker-compose up -d postgres`
3. Ejecutar en modo desarrollo: `npm run dev`
4. Modo In-Memory (sin DB): `npm run dev:inmemory`

---

## 5. Estructura del Proyecto

La arquitectura sigue principios de **Clean Architecture** y **Domain-Driven Design (DDD)** para separar las reglas de negocio de la infraestructura:

```text
src/
├── domain/                # Núcleo del negocio (Casos de uso y lógica pura)
│   ├── services/          # Interfaces y lógica de dominio (Tokens, Passwords)
│   └── use-cases/         # Lógica de aplicación (Register, CreateMatch, etc.)
├── infrastructure/        # Implementaciones técnicas
│   ├── database/          # Migraciones y conexiones SQL
│   ├── persistence/       # Repositorios (Postgres e In-Memory)
│   ├── security/          # Implementación de Bcrypt y JWT
│   └── transport/         # Capa externa (Express, Controllers, Routes)
├── types/                 # Definiciones de tipos e interfaces globales
├── tests/                 # Suite de pruebas (Unitarias e Integración)
├── app.ts                 # Configuración de Express
└── server.ts              # Punto de entrada y arranque del servidor
```

---

## 6. Documentación y Diseño

El proyecto incluye documentación técnica detallada en la carpeta `docs/`:

### Diseño Arquitectónico (RFCs)

En `docs/design/` se encuentran las especificaciones detalladas de cada módulo:

- **[0001_api_design.md](./docs/design/0001_api_design.md)**: Estructura base de la API.
- **[0002_user_model_enhancements.md](./docs/design/0002_user_model_enhancements.md)**: Evolución del modelo de usuario.
- **[0003_auth_and_security.md](./docs/design/0003_auth_and_security.md)**: Seguridad.
- **[0004_user_groupings.md](./docs/design/0004_user_groupings.md)**: Grupos y membresías.
- **[0005_match_management.md](./docs/design/0005_match_management.md)**: Gestión de partidos.

### Diagramas Visuales (Mermaid)

Flujos clave del sistema disponibles en `docs/diagrams/`:

- **[Auth Flow](./docs/diagrams/auth-flow.mermaid)**: Autenticación, Hashing y JWT.
- **[Groups Management](./docs/diagrams/group-management.mermaid)**: Creación de grupos e invitaciones.
- **[Match Lifecycle](./docs/diagrams/match-lifecycle.mermaid)**: Gestión y penalizaciones en partidos.
- **[Clean Architecture](./docs/diagrams/clean-architecture.mermaid)**: Mapa de componentes y dependencias.
- **[Data Model (ERD)](./docs/diagrams/data-model.mermaid)**: Diagrama Entidad-Relación de la Base de Datos.

### Especificación OpenAPI

- **[OpenAPI Spec](./docs/openapi.yaml)**: Contrato técnico para testing (Postman/Swagger).

### Guías de Uso (cURL)

- **[Ejemplos Prácticos](./docs/curl/)**: Scripts para probar flujos completos.

---

## 7. Funcionalidades Principales

### 🔐 Gestión de Usuarios

- Registro con validación de email y username únicos.
- Autenticación segura mediante JWT.
- Perfiles de usuario actualizables.

### 👥 Grupos de Usuarios

- Creación y gestión de grupos deportivos.
- Sistema de invitaciones y roles (Owner, Manager, Member).
- Gestión de membresías (unirse/abandonar grupos).

### ⚽ Gestión de Partidos (Matches)

- Creación de partidos asociados a grupos específicos.
- Control de capacidad, precios y ubicación.
- Inscripción y desinscripción dinámica de jugadores.
- **Locking**: Cierre automático de inscripciones antes del evento.
- **Penalizaciones**: Identificación de cancelaciones de última hora.

---

## 6. Pruebas y Calidad

El proyecto cuenta con una suite de tests automatizados para asegurar la integridad de los casos de uso:

```bash
npm test
```

---

## 9. Guía para Desarrolladores

Información técnica crítica para continuar el desarrollo o mantenimiento del proyecto.

### 🛠 Scripts Disponibles

El `package.json` incluye comandos esenciales para el ciclo de vida del desarrollo:

- `npm run dev`: Inicia el servidor en modo desarrollo (watch mode).
- `npm run build`: Compila el código TypeScript a JavaScript en `./dist`.
- `npm run db:migrate`: Ejecuta las migraciones pendientes en la base de datos configurada.
- `npm run db:reset`: **¡Cuidado!** Borra la base de datos completa y vuelve a ejecutar todas las migraciones (útil para tests e integración continua).
- `npm run lint`: Ejecuta el linter para asegurar la calidad del código.

### 🗄 Gestión de Base de Datos (Migraciones)

El proyecto no utiliza un ORM pesado (como TypeORM o Prisma) para la estructura, sino **SQL nativo** para máximo control y rendimiento.

- Las migraciones se encuentran en: `src/infrastructure/database/migrations/`.
- **Convención de Nombres**: `XXXX_descripcion_breve.sql` (ej: `0005_add_cancel_reason.sql`).
- Para crear una nueva tabla o modificar una existente, crea un nuevo archivo SQL y reinicia el servidor (o ejecuta `npm run db:migrate`).

### 🏗 Cómo añadir una nueva funcionalidad

Sigue el flujo de **Clean Architecture**:

1.  **Dominio**: Define la Interfaz del Repositorio (`IThingRepository`) y el Modelo (`Thing`) en `src/types/`.
2.  **Caso de Uso**: Implementa la lógica pura en `src/domain/use-cases/`.
3.  **Persistencia**: Implementa el repositorio en `src/infrastructure/persistence/postgres/`.
4.  **Transporte**: Crea el Controlador (`ThingController`) y la Ruta (`thing-routes.ts`) en `src/infrastructure/transport/`.
5.  **Tests**: Añade un test de integración en `tests/`.

### 📝 Convenciones de Código

- **Commits**: Se sigue la convención [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`).
- **Estilo**: Se utiliza `prettier` para el formato automático.

---

_Este proyecto es parte del Trabajo de Fin de Máster de Daniel Mendoza Lara._
