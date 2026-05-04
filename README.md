# Nestle AI Newsletter

Application for creating and managing internal newsletters with a React frontend, a NestJS backend, and a PostgreSQL/Supabase database.

## English

### Project Structure

```txt
.
|-- backend/                 # NestJS API
|   |-- prisma/              # Prisma schema and config
|   |-- src/
|   |   |-- areas/           # Areas feature: controller, service, module
|   |   |-- prisma/          # PrismaModule and PrismaService
|   |   |-- supabase/        # SupabaseModule and SupabaseService
|   |   |-- app.controller.ts
|   |   |-- app.module.ts
|   |   `-- main.ts
|   |-- test/                # E2E tests
|   |-- Dockerfile
|   |-- package.json
|   `-- pnpm-lock.yaml
|
|-- frontend/                # React + Vite + MUI app
|   |-- public/
|   |-- src/
|   |   |-- assets/          # Logos, images, and fonts
|   |   |-- styles/          # Nestle MUI theme
|   |   |-- App.tsx
|   |   `-- main.tsx
|   |-- Dockerfile
|   |-- package.json
|   `-- pnpm-lock.yaml
|
|-- .github/workflows/       # Backend and frontend CI
|-- docker-compose.yaml
`-- README.md
```

### Stack

Backend:

- NestJS
- TypeScript
- Prisma 7
- PostgreSQL/Supabase
- Supabase client
- Docker

Frontend:

- React
- TypeScript
- Vite
- MUI
- Custom Nestle theme with fonts and logos
- Docker + nginx for production builds

### Requirements

- Node.js 20
- pnpm 10.33.0
- Docker Desktop, optional for containers
- Configured PostgreSQL/Supabase database

### Environment Variables

Create `backend/.env` locally. Do not commit it.

Example:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
SUPABASE_URL="https://..."
SUPABASE_SERVICE_ROLE_KEY="..."
SUPABASE_ASSETS_BUCKET="assets"
PORT=3000
AI_PROVIDER="gemini"
GEMINI_API_KEY="AIza..."
GEMINI_MODEL="gemini-2.5-flash-lite"
NESTLE_GENIA_URL="https://eur-sdr-int-pub.nestle.com/api/dv-exp-sandbox-openai-api/1/genai/GCP/gemini-2.5-pro/generateContent"
NESTLE_GENIA_MODEL="gemini-2.5-pro"
```

Notes:

- `DATABASE_URL` is used by Prisma at runtime.
- `DIRECT_URL` is used for direct Prisma tasks, introspection, or migrations.
- `SUPABASE_SERVICE_ROLE_KEY` is sensitive. Never push it to GitHub.
- `SUPABASE_ASSETS_BUCKET` stores uploaded newsletter images/assets for AI-assisted creation.
- `AI_PROVIDER` selects the active provider for `POST /ai/improve-text` and `POST /ai/generate-newsletter`. Use `gemini` by default or `nestle` to route through Nestle GenIA.
- `GEMINI_API_KEY` is required when `AI_PROVIDER="gemini"`.
- `CLIENT_ID` and `CLIENT_SECRET` are required when `AI_PROVIDER="nestle"`.
- `GEMINI_MODEL`, `NESTLE_GENIA_URL`, and `NESTLE_GENIA_MODEL` are optional overrides for the AI endpoints.

### Installation

Backend:

```bash
pnpm --dir backend install
```

Frontend:

```bash
pnpm --dir frontend install
```

### Local Development

Backend with hot reload:

```bash
pnpm --dir backend run start:dev
```

API:

```txt
http://localhost:3000
```

Frontend with Vite:

```bash
pnpm --dir frontend run dev
```

Web:

```txt
http://localhost:5173
```

If port `3000` is already in use:

```powershell
$env:PORT=3001; pnpm --dir backend run start:dev
```

### Prisma

The backend uses Prisma Client through `PrismaService`.

Generate Prisma Client:

```bash
pnpm --dir backend exec prisma generate
```

The backend build already runs `prisma generate` automatically:

```bash
pnpm --dir backend run build
```

`backend/prisma.config.ts` is prepared so `prisma generate` can run in CI without database environment variables.

### Current Routes

Backend:

```txt
GET /              # Health/simple hello
GET /prisma-test   # Temporary Prisma connection test
GET /areas         # List areas
GET /areas/:id     # Find area by id
POST /ai/improve-text  # Improve newsletter text with Gemini or Nestle GenIA
```

`/prisma-test` is only for connection validation. Final business routes should live in feature modules such as `areas/`, `users/`, `newsletters/`, etc.

### Adding A Module

Example for a `users` feature:

```txt
backend/src/users/
|-- users.controller.ts
|-- users.service.ts
`-- users.module.ts
```

Expected flow:

```txt
HTTP Request
  -> Controller
  -> Service
  -> PrismaService
  -> Database
```

After creating the module, import it in `backend/src/app.module.ts`.

### Build

Backend:

```bash
pnpm --dir backend run build
```

Frontend:

```bash
pnpm --dir frontend run build
```

### Tests

Backend unit tests:

```bash
pnpm --dir backend run test
```

Backend e2e:

```bash
pnpm --dir backend exec jest --config ./test/jest-e2e.json --runInBand
```

### Docker

Build and run with Docker Compose:

```bash
docker compose up --build
```

Services:

```txt
Backend:  http://localhost:3000
Frontend: http://localhost:5173
```

The frontend is built with Node and served with nginx inside the container. In `docker-compose.yaml`, host port `5173` maps to frontend container port `80`.

### CI

GitHub Actions has two workflows:

- `.github/workflows/backend.yml`
- `.github/workflows/frontend.yml`

Backend CI:

- Installs dependencies with pnpm.
- Runs `prisma generate`.
- Builds NestJS.
- Validates `docker build`.

Frontend CI:

- Installs dependencies with pnpm.
- Builds Vite.
- Validates `docker build`.

### Security

Do not commit:

- `backend/.env`
- `frontend/.env`
- `backend/dist/`
- `frontend/dist/`
- `node_modules/`

If a secret is committed by accident:

1. Remove it from local history before pushing.
2. Rotate the secret in the corresponding provider.
3. Verify that `.gitignore` covers the file.

### Current State

The project currently has:

- Working NestJS backend.
- Prisma connected through the PostgreSQL adapter.
- Basic `areas` module.
- React frontend with a minimal landing page.
- MUI theme with Nestle fonts and logos.
- Dockerfiles for backend and frontend.
- Docker Compose for running both services.
- Separate CI for backend and frontend.

## Espanol

Aplicacion para crear y gestionar newsletters internos con frontend React, backend NestJS y base de datos PostgreSQL/Supabase.

## Estructura

```txt
.
|-- backend/                 # API NestJS
|   |-- prisma/              # Prisma schema y config
|   |-- src/
|   |   |-- areas/           # Feature areas: controller, service, module
|   |   |-- prisma/          # PrismaModule y PrismaService
|   |   |-- supabase/        # SupabaseModule y SupabaseService
|   |   |-- app.controller.ts
|   |   |-- app.module.ts
|   |   `-- main.ts
|   |-- test/                # Tests e2e
|   |-- Dockerfile
|   |-- package.json
|   `-- pnpm-lock.yaml
|
|-- frontend/                # App React + Vite + MUI
|   |-- public/
|   |-- src/
|   |   |-- assets/          # Logos, imagenes y fuentes
|   |   |-- styles/          # Theme MUI de Nestle
|   |   |-- App.tsx
|   |   `-- main.tsx
|   |-- Dockerfile
|   |-- package.json
|   `-- pnpm-lock.yaml
|
|-- .github/workflows/       # CI backend y frontend
|-- docker-compose.yaml
`-- README.md
```

## Stack

Backend:

- NestJS
- TypeScript
- Prisma 7
- PostgreSQL/Supabase
- Supabase client
- Docker

Frontend:

- React
- TypeScript
- Vite
- MUI
- Theme propio con fuentes y logos de Nestle
- Docker + nginx para servir build de produccion

## Requisitos

- Node.js 20
- pnpm 10.33.0
- Docker Desktop, opcional para correr con contenedores
- Base PostgreSQL/Supabase configurada

## Variables De Entorno

Crear `backend/.env` localmente. No se debe commitear.

Ejemplo:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
SUPABASE_URL="https://..."
SUPABASE_SERVICE_ROLE_KEY="..."
SUPABASE_ASSETS_BUCKET="assets"
PORT=3000
AI_PROVIDER="gemini"
GEMINI_API_KEY="AIza..."
GEMINI_MODEL="gemini-2.5-flash-lite"
NESTLE_GENIA_URL="https://eur-sdr-int-pub.nestle.com/api/dv-exp-sandbox-openai-api/1/genai/GCP/gemini-2.5-pro/generateContent"
NESTLE_GENIA_MODEL="gemini-2.5-pro"
```

Notas:

- `DATABASE_URL` se usa en runtime por Prisma.
- `DIRECT_URL` se usa para tareas directas de Prisma, introspeccion o migraciones.
- `SUPABASE_SERVICE_ROLE_KEY` es sensible. No subirla nunca a GitHub.
- `SUPABASE_ASSETS_BUCKET` guarda imagenes/assets subidos para la creacion asistida por IA.
- `AI_PROVIDER` selecciona el proveedor activo para `POST /ai/improve-text` y `POST /ai/generate-newsletter`. Usar `gemini` por defecto o `nestle` para enrutar por Nestle GenIA.
- `GEMINI_API_KEY` es obligatoria cuando `AI_PROVIDER="gemini"`.
- `CLIENT_ID` y `CLIENT_SECRET` son obligatorias cuando `AI_PROVIDER="nestle"`.
- `GEMINI_MODEL`, `NESTLE_GENIA_URL` y `NESTLE_GENIA_MODEL` son overrides opcionales para los endpoints de IA.

## Instalacion

Backend:

```bash
pnpm --dir backend install
```

Frontend:

```bash
pnpm --dir frontend install
```

## Desarrollo Local

Backend con hot reload:

```bash
pnpm --dir backend run start:dev
```

API:

```txt
http://localhost:3000
```

Frontend con Vite:

```bash
pnpm --dir frontend run dev
```

Web:

```txt
http://localhost:5173
```

Si el puerto `3000` esta ocupado:

```powershell
$env:PORT=3001; pnpm --dir backend run start:dev
```

## Prisma

El backend usa Prisma Client a traves de `PrismaService`.

Generar cliente Prisma:

```bash
pnpm --dir backend exec prisma generate
```

El build del backend ya corre `prisma generate` automaticamente:

```bash
pnpm --dir backend run build
```

`backend/prisma.config.ts` esta preparado para que `prisma generate` funcione en CI aunque no existan variables de base de datos.

## Rutas Actuales

Backend:

```txt
GET /              # Health/simple hello
GET /prisma-test   # Prueba temporal de conexion Prisma
GET /areas         # Lista areas
GET /areas/:id     # Busca area por id
POST /ai/improve-text  # Mejora texto del newsletter con Gemini o Nestle GenIA
```

La ruta `/prisma-test` es solo para validar conexion. Las rutas definitivas deben vivir en modulos de feature como `areas/`, `users/`, `newsletters/`, etc.

## Como Agregar Un Modulo

Ejemplo para una feature `users`:

```txt
backend/src/users/
|-- users.controller.ts
|-- users.service.ts
`-- users.module.ts
```

Flujo esperado:

```txt
Request HTTP
  -> Controller
  -> Service
  -> PrismaService
  -> Database
```

Despues de crear el modulo, importarlo en `backend/src/app.module.ts`.

## Build

Backend:

```bash
pnpm --dir backend run build
```

Frontend:

```bash
pnpm --dir frontend run build
```

## Tests

Backend unit tests:

```bash
pnpm --dir backend run test
```

Backend e2e:

```bash
pnpm --dir backend exec jest --config ./test/jest-e2e.json --runInBand
```

## Docker

Build y run con Docker Compose:

```bash
docker compose up --build
```

Servicios:

```txt
Backend:  http://localhost:3000
Frontend: http://localhost:5173
```

El frontend se construye con Node y se sirve con nginx en el contenedor. En `docker-compose.yaml`, el puerto `5173` del host apunta al puerto `80` del contenedor frontend.

## CI

GitHub Actions tiene dos workflows:

- `.github/workflows/backend.yml`
- `.github/workflows/frontend.yml`

Backend CI:

- Instala dependencias con pnpm.
- Ejecuta `prisma generate`.
- Compila NestJS.
- Valida `docker build`.

Frontend CI:

- Instala dependencias con pnpm.
- Compila Vite.
- Valida `docker build`.

## Seguridad

No commitear:

- `backend/.env`
- `frontend/.env`
- `backend/dist/`
- `frontend/dist/`
- `node_modules/`

Si una secret se commitea por accidente, hay que:

1. Quitarla del historial local antes de pushear.
2. Rotar la secret en el proveedor correspondiente.
3. Verificar que `.gitignore` cubra el archivo.

## Estado Actual

El proyecto ya tiene:

- Backend NestJS funcionando.
- Prisma conectado mediante adapter PostgreSQL.
- Modulo basico de `areas`.
- Frontend React con landing minima.
- Theme MUI con fuentes y logos de Nestle.
- Dockerfiles para backend y frontend.
- Docker Compose para levantar ambos servicios.
- CI separado para backend y frontend.
