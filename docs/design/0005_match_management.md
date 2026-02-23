# Diseño de Gestión de Partidos (Versión Final Revisada)

## 1. Introducción
Este documento define el sistema para organizar partidos, el sistema de méritos para la selección de jugadores y el ciclo de vida de un encuentro deportivo.

## 2. Extensiones al Modelo de Datos Existente

### Tabla: `groups` (Ampliación)
Nuevas propiedades para configurar el sistema de méritos y penalizaciones:
- `merit_config_max_matches`: INTEGER (Últimos partidos a contabilizar) (Default: 10)
- `merit_points_played`: INTEGER (Puntos por partido jugado) (Default: 3)
- `merit_points_no_show`: INTEGER (Puntos por no presentarse) (Default: -5)
- `merit_points_reserve`: INTEGER (Puntos por quedar como reserva) (Default: 1)
- `merit_points_positive_attitude`: INTEGER (Puntos por actitud positiva) (Default: 1)
- `merit_points_negative_attitude`: INTEGER (Puntos por actitud negativa) (Default: -1)
- `merit_config_hours_before_penalty`: INTEGER (Horas límite para cancelar sin penalización) (Default: 12)
- `merit_points_late_cancel`: INTEGER (Puntos negativos por cancelación tardía) (Default: -2)

## 3. Modelo de Datos

### Tabla: `matches`
- `id`: UUID (Primary Key)
- `group_id`: UUID (Foreign Key -> `groups.id`)
- `sport`: ENUM ('football', 'basketball', 'padel') (Requerido)
- `scheduled_at`: TIMESTAMP WITH TIME ZONE (Requerido)
- `duration_minutes`: INTEGER (Requerido)
- `capacity`: INTEGER (Requerido, número total de jugadores)
- `location`: TEXT (Requerido)
- `status`: ENUM ('planning', 'playing', 'finished', 'cancelled') (Default: 'planning')
- `is_locked`: BOOLEAN (Default: false. Bloquea toda modificación)
- `team_a_color`: VARCHAR(7) (Requerido, formato '#RRGGBB') (Default: '#000000')
- `team_b_color`: VARCHAR(7) (Requerido, formato '#RRGGBB') (Default: '#FFFFFF')
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### Tabla: `match_registrations`
- `match_id`: UUID (Foreign Key -> `matches.id`)
- `user_id`: UUID (Foreign Key -> `users.id`)
- `registered_at`: TIMESTAMP (Fecha de inscripción para desempate)
- `is_reserve`: BOOLEAN (Indica si quedó fuera por capacidad) Default: false
- `did_play`: BOOLEAN (Confirmación post-partido de si asistió)
- `attitude`: ENUM ('positive', 'negative', 'neutral') (Default: 'neutral') Default: neutral
- `is_late_cancellation`: BOOLEAN (Default: false. Indica si el usuario se quitó tarde)
- `Primary Key`: (`match_id`, `user_id`)

## 4. Reglas de Negocio

### Gestión Administrativa
- Solo los **Owners** pueden crear partidos y configurar los puntos de mérito del grupo.
- **Bloqueo**: Con `is_locked = true`, no se permite ninguna modificación en el partido ni en las evaluaciones.

### Ciclo de Vida y Estados
- `planning` -> `playing` o `cancelled`.
- **Al pasar a `playing`**: El sistema marca automáticamente como `is_reserve = true` a los usuarios que queden fuera de la `capacity` según el orden de la lista de méritos en ese instante.
- `playing` -> `finished` o `cancelled`.
- `finished` -> Habilita evaluación de participantes.

### Sistema de Méritos (Selección de Jugadores)
La prioridad en la lista se calcula dinámicamente:
1.  **Criterio 1 (Puntos acumulados)**: Suma de puntos de los últimos `X` partidos disputados (según configuración del grupo), **excluyendo el partido actual**. Se incluyen puntos por jugar, reservas, actitud y penalizaciones por cancelación tardía.
2.  **Criterio 2 (Antigüedad de Registro)**: En caso de empate en puntos, prioridad por fecha de inscripción (`registered_at`) al partido actual.

### Cancelación Tardía
- Si un usuario intenta salirse (`DELETE /participants/me`) faltando menos de `merit_config_hours_before_penalty` horas para el inicio (`scheduled_at`):
    - El registro se mantiene en la tabla pero se marca como `is_late_cancellation = true`.
    - El usuario se desplaza al final de la lista de participantes para ese partido (si no se ha pasado a `playing` todavía).
    - Se aplican los puntos negativos de `merit_points_late_cancel` para futuros cálculos.

## 5. API Endpoints

### Partidos
- `POST /api/matches`: Crear partido (Solo Owners).
- `PATCH /api/matches/{id}`: Actualizar metadatos (ubicación, fecha, etc.). Solo Owners si no está bloqueado.
- `PATCH /api/matches/{id}/status`: Cambiar estado (Valida transiciones y gestiona reservas automáticamente). Solo Owners si no está bloqueado.
- `PATCH /api/matches/{id}/lock`: Bloquear partido definitivamente. Solo Owners si no está bloqueado.
- `GET /api/groups/{id}/matches`: Listar.

### Participantes y Evaluación
- `POST /api/matches/{id}/participants`: Apuntarse (Solo en 'planning') y no bloqueado.
- `DELETE /api/matches/{id}/participants/me`: Salirse (Gestiona penalización tardía). Solo en 'planning' y no bloqueado.
- `GET /api/matches/{id}/participants`: Lista ordenada por méritos (indicando quiénes entran y quiénes son reservas).
- `PATCH /api/matches/{id}/participants/{userId}/evaluation`: Evaluar `did_play` y `attitude`. Solo en 'finished' y no bloqueado.
