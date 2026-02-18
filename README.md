# Lets Play API

API para gestionar partidos de deportes en equipo.

## Requisitos Previos

- [Docker](https://www.docker.com/products/docker-desktop)
- [Node.js](https://nodejs.org/) (para desarrollo local sin Docker)

## Instalación y Ejecución con Docker (Recomendado)

Puedes desplegar la aplicación completa (Servidor API + Base de Datos PostgreSQL) utilizando Docker Compose.

### 1. Configuración de Entorno

Asegúrate de tener un archivo `.env` en la raíz del proyecto. Puedes usar el archivo de ejemplo como base:

```bash
cp .env.example .env
```

### 2. Ejecutar la Aplicación

Para levantar todo el entorno, ejecuta:

```bash
docker-compose up -d
```

Esto iniciará:
- **API**: Accesible en `http://localhost:3000`
- **Base de Datos**: PostgreSQL en el puerto `5432`

Para ver los logs:

```bash
docker-compose logs -f
```

Para detener los servicios:

```bash
docker-compose down
```

## Uso de Docker (Solo Imagen)

Si solo quieres generar o ejecutar la imagen del servidor individualmente:

### Construir la imagen

```bash
docker build -t lets-play-api .
```

### Ejecutar el contenedor

```bash
docker run -d -p 3000:3000 --env-file .env lets-play-api
```

## Desarrollo Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Levantar la base de datos (si no usas Docker para todo):
   ```bash
   docker-compose up -d postgres
   ```

3. Ejecutar migraciones (si aplica):
   ```bash
   npm run db:migrate
   ```

4. Iniciar servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

5. Modo In-Memory (sin base de datos):
   ```bash
   npm run dev:inmemory
   ```
