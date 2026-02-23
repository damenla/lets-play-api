# Roadmap de Próximos Pasos (Let's Play API)

Este documento detalla la hoja de ruta planificada para la evolución de la API, dividida por áreas estratégicas de mejora técnica y funcional.

---

## 1. Calidad de Código y Arquitectura (Prioridad Alta)

- **Middleware de Errores Global**: Implementar un manejador centralizado en Express para unificar las respuestas de error (JSON estándar) y limpiar los controladores de bloques `try/catch`.
- **Validación de Esquemas (Zod)**: Sustituir la validación manual por esquemas de [Zod](https://zod.dev/) en la capa de transporte para garantizar la integridad de los datos de entrada (Body, Params, Query).
- **Logs Profesionales**: Integración de **Winston** o **Pino** para la trazabilidad de logs por niveles (`info`, `warn`, `error`) y persistencia en ficheros o servicios de agregación de logs.

## 2. Nuevas Funcionalidades de Dominio

- **Gestión Administrativa**: Implementar el caso de uso para que los administradores (Owners/Managers) puedan expulsar miembros de un grupo.
- **CancelMatchUseCase**: Lógica para cancelar partidos de forma oficial, notificando a los inscritos y gestionando el estado histórico.
- **Sistema de Listas de Espera**: Automatizar el paso de jugadores de "Reserva" a "Inscritos" cuando alguien abandona el partido.

## 3. Interfaz de Usuario y Acceso Visual (Frontend)

- **Endpoint `/api/users/me/matches`**: Dashboard centralizado para que el usuario vea todos sus próximos encuentros de cualquier grupo.
- **Endpoint `/api/users/me/invitations`**: Vista unificada de invitaciones pendientes para agilizar la gestión de membresías.
- **Notificaciones**: Diseño de un sistema de notificaciones (Push o Email) para alertar sobre nuevos partidos o cambios de estado.
- **Portal Web (PWA)**: Desarrollo de una interfaz web responsive para que los usuarios puedan:
    - Visualizar sus próximos partidos de un vistazo.
    - Gestionar su perfil y méritos por grupo.
    - Recibir notificaciones web de nuevas invitaciones.
- **Evaluación de App Móvil (Android/iOS)**: Valoración de tecnologías multiplataforma para maximizar el alcance con un solo código base:
    - **Compose Multiplatform**: Opción nativa moderna y altamente eficiente.
    - **Flutter**: Estabilidad y rapidez de desarrollo UI.
    - **React Native**: Aprovechando el ecosistema JavaScript actual del proyecto.

## 4. Estabilidad y DevOps

- **Entorno de Tests con DB Real**: Configurar una base de datos PostgreSQL dedicada para tests de integración (usando Docker o Testcontainers) para validar la lógica SQL real.
- **Graceful Shutdown**: Implementar el cierre ordenado de la aplicación, asegurando que el pool de conexiones a Postgres se libere correctamente al detener el servidor.
- **CI/CD Pipeline**: Configuración de GitHub Actions para ejecución automática de tests y linting en cada Pull Request.

---

_Este Roadmap forma parte de la visión estratégica del TFM de Daniel Mendoza Lara._
