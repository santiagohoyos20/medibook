# MediBook

API REST para la gestión de citas médicas. Permite a pacientes registrarse, buscar médicos y agendar citas con validación de conflictos de horario y fechas pasadas.

## Requisitos

- **Node.js** v20 o superior
- **PostgreSQL** v14 o superior

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/medibook"
JWT_SECRET="tu_secreto_jwt"
JWT_EXPIRES_IN="7d"
PORT=3000
```

## Instalación

```bash
npm install
```

## Migraciones

```bash
npx prisma migrate dev
```

## Iniciar en desarrollo

```bash
npm run start:dev
```

## Tests

```bash
# Unit tests
npm run test

# Tests e2e (requiere base de datos de test activa con DATABASE_URL configurada)
npm run test:e2e

# Cobertura
npm run test:cov
```

## Endpoints

### Health

| Método | Ruta    | Descripción         | Auth |
|--------|---------|---------------------|------|
| GET    | /health | Estado del servidor | No   |

### Auth

| Método | Ruta           | Descripción                          | Auth |
|--------|----------------|--------------------------------------|------|
| POST   | /auth/register | Registrar usuario (paciente o médico) | No  |
| POST   | /auth/login    | Iniciar sesión, devuelve JWT         | No   |

**Body registro paciente:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string (mín. 8 caracteres)",
  "role": "PATIENT"
}
```

**Body registro médico:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string (mín. 8 caracteres)",
  "role": "DOCTOR",
  "specialty": "string"
}
```

### Doctors

| Método | Ruta         | Descripción                                | Auth |
|--------|--------------|--------------------------------------------|------|
| GET    | /doctors     | Listar médicos (acepta `?specialty=` query) | No  |
| GET    | /doctors/:id | Obtener médico por ID                      | No   |

### Appointments

| Método | Ruta                | Descripción                           | Auth   |
|--------|---------------------|---------------------------------------|--------|
| POST   | /appointments       | Crear cita                            | Bearer |
| GET    | /appointments       | Listar citas del paciente autenticado | Bearer |
| GET    | /appointments/:id   | Obtener cita por ID                   | Bearer |
| PATCH  | /appointments/:id   | Actualizar estado de una cita         | Bearer |
| DELETE | /appointments/:id   | Eliminar una cita                     | Bearer |

**Body creación de cita:**
```json
{
  "doctorId": "string",
  "date": "2026-06-01",
  "timeSlot": "10:00",
  "reason": "string"
}
```

### Users

| Método | Ruta        | Descripción            | Auth |
|--------|-------------|------------------------|------|
| GET    | /users      | Listar usuarios        | No   |
| GET    | /users/:id  | Obtener usuario por ID | No   |
| POST   | /users      | Crear usuario          | No   |
| DELETE | /users/:id  | Eliminar usuario       | No   |
