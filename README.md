# MediBook

REST API for managing medical appointments. Allows patients to register, search for doctors, and schedule appointments with conflict validation and past-date checks.

## Requirements

- **Node.js** v20 or higher
- **PostgreSQL** v14 or higher

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/medibook"
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="7d"
PORT=3000
```

## Installation

```bash
npm install
```

## Migrations

```bash
npx prisma migrate dev
```

## Start in Development

```bash
npm run start:dev
```

## Tests

```bash
# Unit tests
npm run test

# E2E tests (requires an active test database with DATABASE_URL configured)
npm run test:e2e

# Coverage
npm run test:cov
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
