# NEXT STEPS

He revisado el estado actual del proyecto y, aunque hemos completado con éxito toda la lógica de Agrupaciones de Usuarios (Diseño 0004), todavía quedan pasos importantes para que la API sea funcional para su propósito final: la gestión de partidos.

Aquí tienes los próximos pasos propuestos:

1. **Funcionalidad de Partidos (Matches)**

    Este es el núcleo de la aplicación que aún no hemos empezado. Siguiendo la metodología TDD, deberíamos:
    - Diseñar el modelo de datos para Partidos (fecha, lugar, deporte, grupo asociado, capacidad, precio, etc.).
    - Implementar la lógica para que los miembros de un grupo puedan apuntarse o borrarse de un partido.
    - Implementar la gestión de listas de espera si se supera la capacidad.

2. **Gestión Administrativa de Miembros**

    Aunque implementamos la salida voluntaria, el diseño mencionaba la capacidad de los administradores de gestionar a otros miembros:
    - **Eliminar Miembros**: Permitir que un Owner o Manager expulse a un miembro del grupo (respetando la jerarquía).

3. **Refactorización y Deuda Técnica**
    - **Validación de Esquemas (Zod/Joi)**: Actualmente validamos manualmente en los casos de uso. Sería ideal usar una librería de validación de esquemas en los controladores para devolver errores de formato más precisos antes de llegar al dominio.
    - **Manejo de Errores Global**: Crear un middleware de error centralizado en Express para evitar los bloques try/catch repetitivos en el controlador y estandarizar aún más las respuestas.
    - **Entorno de Tests con DB Real**: Ahora que tenemos persistencia en Postgres, sería bueno configurar una base de datos de test (por ejemplo, con Docker o una base de datos temporal) para que los tests de integración corran contra SQL real y no solo en memoria.

4. **Nuevos Deportes y Preferencias**
    - Añadir al modelo de usuario preferencias de deportes.
    - Validar que los grupos o partidos pertenezcan a categorías de deportes específicas.

---

Tras el éxito de la validación contra PostgreSQL, estos son los puntos que quedan pendientes para que el sistema sea profesional y esté listo para producción:

1. Arquitectura y Limpieza (Prioridad Alta)

- Middleware de Manejo de Errores Global: Actualmente los controladores (GroupController, MatchController, etc.) repiten mucha lógica en sus métodos
  handleError. Debemos centralizar esto en un middleware de Express que traduzca excepciones de dominio a códigos HTTP.
- Validación de entrada (Request Validation): Actualmente confiamos en que el body de la petición cumple con la interfaz. Deberíamos implementar validación con
  una librería como Zod para devolver errores 400 claros antes de llegar al caso de uso.

2. Funcionalidades de Dominio Faltantes

- Caso de Uso: `CancelMatchUseCase`: Implementar la lógica para mover un partido a estado cancelled. Esto debería validar que no se pueda cancelar si ya ha
  terminado o está bloqueado, y notificar (o limpiar) los registros.
- Lógica de "Late Cancellation" refinada: Ya tenemos la marca en DB, pero podríamos añadir un endpoint para que el Owner pueda perdonar una penalización tardía
  si el usuario justifica su ausencia.

3. Experiencia de Usuario (Frontend-Friendly)

- `GET /api/users/me/matches`: Endpoint que devuelva todos los partidos donde el usuario está apuntado (de cualquier grupo), ordenados por fecha. Es vital para
  un dashboard.
- `GET /api/users/me/invitations`: Listar todas las invitaciones pendientes a grupos de forma centralizada.

4. Estabilidad y DevOps

- Graceful Shutdown: Asegurar que al detener el servidor, el pool de conexiones de PostgreSQL se cierre correctamente para evitar conexiones huérfanas.
- Logs Profesionales: Sustituir console.log por una librería de logging (como winston o pino) que permita diferentes niveles (info, error, debug).
- Validación de Variables de Entorno: Un pequeño script al arrancar que verifique que todas las variables del .env necesarias están presentes y tienen el
  formato correcto.

¿Por cuál de estos grupos te gustaría continuar? (Mi recomendación: El middleware de errores para limpiar el código de los controladores).
