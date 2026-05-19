# Agentic Coding Process

## 1. Tools Used

**Claude Code**
The primary AI tool used throughout the project. Accessed via the VSCode extension and CLI. Used for scaffolding the initial NestJS project structure, generating modules (auth, doctors, appointments), writing DTOs, implementing business logic, and generating unit tests. Also used to review and debug errors during development.

---

## 2. My Approach

I started by planning the solution together with Claude — discussing the architecture, the modules needed, and the main business rules before writing any code. Once the plan was clear, I handled the initial project setup myself (NestJS init, Prisma config, Docker Compose for PostgreSQL).

From there I went module by module: auth first, then doctors, then appointments. For each one I implemented it with Claude's help and immediately verified that everything worked correctly — running the server, hitting the endpoints manually, and checking the responses. Whenever something didn't behave as expected I debugged it on the spot, using Claude to help identify the issue and fix it.

At the end of the project I used Claude again to help write the documentation, including the README and this file.

---

## 3. Key Prompts

### Prompt 1 — Auth module with role-based registration

**What I asked:**
> "Generate a NestJS AuthService that handles registration for both PATIENT and DOCTOR roles. If the role is DOCTOR, it must also create a Doctor record with a specialty field. Use bcrypt for password hashing and return a JWT on both register and login. Use Prisma transactions for the doctor creation. Throw appropriate NestJS HTTP exceptions for duplicate email, missing specialty, and invalid credentials."

**What it generated:**
The full `auth.service.ts` including the `$transaction` block that creates both the User and Doctor atomically. It also generated `register.dto.ts` and `login.dto.ts` with `class-validator` decorators.

---

### Prompt 2 — Appointments service with conflict detection

**What I asked:**
> "Create an AppointmentsService in NestJS with Prisma. It needs: create (validate date is not in the past, check for conflicting doctorId+date+timeSlot), findAll (only for the authenticated patient), findOne (throw NotFoundException if missing), update (only owner can update, block if status is COMPLETED or CANCELLED), remove (only owner can delete). Use appropriate HTTP exceptions."

**What it generated:**
The complete `appointments.service.ts` as seen in the codebase — including the `findUnique` conflict check using the composite unique key `doctorId_date_timeSlot`, and the ownership check comparing `appointment.patientId !== userId`.

**Verdict:** Used as-is. The conflict detection logic was correct and matched the Prisma schema's composite unique constraint exactly.

---

### Prompt 3 — Unit tests for AppointmentsService

**What I asked:**
> "Write Jest unit tests for the AppointmentsService. Mock PrismaService. Cover: create throws BadRequestException for past dates, create throws ConflictException for duplicate slots, update throws ForbiddenException when userId doesn't match patientId, update throws BadRequestException for COMPLETED/CANCELLED appointments."

**What it generated:**
A full spec file with a `beforeEach` that creates a NestJS testing module with a mocked `PrismaService`. Each test case used `jest.fn()` to return specific mocked values.

**Verdict:** Modified. The generated tests used `mockResolvedValueOnce` correctly for async Prisma calls, but the past-date test was using `new Date()` directly, which made it flaky depending on millisecond timing. I replaced it with a hardcoded past date string (`'2020-01-01'`) to make the test deterministic.

---

## 4. Critical Evaluation

### Piece evaluated: `AppointmentsService.create` — past-date validation

```typescript
const appointmentDate = new Date(dto.date);
if (appointmentDate < new Date()) {
  throw new BadRequestException('Appointment date cannot be in the past');
}
```

**What the AI got right:**
The logic is correct and concise. Using `new Date()` as the comparison point is the right approach for this use case.

**What it got wrong / what I improved:**
The initial generated version compared the date without considering that `dto.date` comes in as a date-only string (`"2026-06-01"`), which JavaScript parses as UTC midnight. This meant that if a patient in a UTC-5 timezone tried to book for today, the comparison could incorrectly reject the appointment. I added a note in the DTO to document this limitation, and evaluated whether it was a real problem for the scope of this API (it was acceptable for now).

Additionally, the AI did not validate that `dto.doctorId` actually exists in the database before creating the appointment. The foreign key constraint on the database would catch this, but it would produce a raw Prisma error instead of a clean `404`. I added a `doctor` existence check before the conflict query.

**How I verified it works:**
Ran the API manually with edge-case dates (yesterday, today, tomorrow) using a REST client and confirmed the correct exceptions were thrown. Also verified the unit tests passed with `npm run test`.

**Security issues introduced:**
None critical. The AI correctly used `patientId` from the JWT payload (not from the request body), preventing patients from creating appointments on behalf of others. Ownership checks on update and delete were also correct.

---

## 5. What I Learned

**Prisma composite unique constraints in `findUnique`:**
Before this project I had only used `findUnique` with single-field keys. The AI's use of `doctorId_date_timeSlot` as a compound key in `findUnique` — matching the `@@unique` defined in the Prisma schema — was new to me. I now understand how Prisma generates the compound key name from the field names joined by underscores.

**NestJS `$transaction` with a callback:**
I had used `$transaction([...])` with an array of promises before, but not the interactive callback form (`$transaction(async (tx) => { ... })`). The callback form allows conditional logic inside the transaction (e.g., only create a Doctor record if the role is DOCTOR), which is not possible with the array form. The AI used this correctly and I learned the distinction.

**JWT strategy with Passport in NestJS:**
The `JwtStrategy` extending `PassportStrategy(Strategy)` with the `validate` method that returns the payload which becomes `req.user` — this pattern was not obvious to me before. Understanding that `validate`'s return value is what gets attached to the request made the guard and controller integration clear.

**`class-validator` with conditional validation:**
Using `@ValidateIf` and `@IsOptional` together to make `specialty` required only for doctors was something I learned by reading the generated DTO and then looking up the docs to understand why it worked.
