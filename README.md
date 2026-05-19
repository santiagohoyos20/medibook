# MediBook

REST API for managing medical appointments. Allows patients to register, search for doctors, and schedule appointments with conflict validation and past-date checks.

## Requirements

- **Node.js** v20 or higher
- **Docker** (for the database)

## Setup

**1. Clone and install dependencies**

```bash
npm install
```

**2. Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` if you need to change any values (the defaults work with the Docker setup below).

**3. Start the database**

```bash
docker-compose up -d
```

**4. Run migrations**

```bash
npx prisma migrate deploy
```

**5. Generate Prisma client**

```bash
npx prisma generate
```

**6. Start the server**

```bash
npm run start:dev
```

> To stop the database: `docker-compose down`
> To stop and delete all data: `docker-compose down -v`

## Tests

```bash
# Unit tests
npm run test

# E2E tests (requires an active test database with DATABASE_URL configured)
npm run test:e2e
```

## Endpoints

### Health

| Method | Route   | Description   | Auth |
|--------|---------|---------------|------|
| GET    | /health | Server status | No   |

### Auth

| Method | Route          | Description                         | Auth |
|--------|----------------|-------------------------------------|------|
| POST   | /auth/register | Register a user (patient or doctor) | No   |
| POST   | /auth/login    | Log in, returns a JWT               | No   |

**Patient registration body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string (min. 8 characters)",
  "role": "PATIENT"
}
```

**Doctor registration body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string (min. 8 characters)",
  "role": "DOCTOR",
  "specialty": "string"
}
```

### Doctors

| Method | Route        | Description                                | Auth |
|--------|--------------|--------------------------------------------|------|
| GET    | /doctors     | List doctors (accepts `?specialty=` query) | No   |
| GET    | /doctors/:id | Get doctor by ID                           | No   |

### Appointments

| Method | Route             | Description                                     | Auth   |
|--------|-------------------|-------------------------------------------------|--------|
| POST   | /appointments     | Create an appointment                           | Bearer |
| GET    | /appointments     | List appointments for the authenticated patient | Bearer |
| GET    | /appointments/:id | Get appointment by ID                           | Bearer |
| PATCH  | /appointments/:id | Update appointment status                       | Bearer |
| DELETE | /appointments/:id | Delete an appointment                           | Bearer |

**Appointment creation body:**
```json
{
  "doctorId": "string",
  "date": "2026-06-01",
  "timeSlot": "10:00",
  "reason": "string"
}
```
