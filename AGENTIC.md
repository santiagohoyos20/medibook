# Agentic Coding Process

## 1. Tools Used

**Claude Code**
The primary AI tool used throughout the project. Accessed via the VSCode extension and CLI. Used for scaffolding the initial NestJS project structure, generating modules (auth, doctors, appointments), writing DTOs, implementing business logic, and generating unit tests. Also used to review and debug errors during development.

**GitHub Copilot**
Used for inline autocompletion while writing code and for generating commit message suggestions. Helped speed up repetitive typing and kept commit names consistent and descriptive.

---

## 2. My Approach

I started by planning the solution together with Claude — discussing the architecture, the modules needed, and the main business rules before writing any code. Once the plan was clear, I handled the initial project setup myself (NestJS init, Prisma config, Docker Compose for PostgreSQL).

Before sending any request to Claude Code, I would first talk with Claude (chat) to think through what I needed and refine the prompt — making it specific, unambiguous, and scoped correctly. Only after Claude helped me sharpen the prompt would I pass it to Claude Code for implementation. This two-step approach consistently produced better, more accurate results than going to Claude Code directly with a rough idea.

From there I went module by module: auth first, then doctors, then appointments. For each one I implemented it with Claude's help and immediately verified that everything worked correctly — running the server, hitting the endpoints manually, and checking the responses. Whenever something didn't behave as expected I debugged it on the spot, using Claude to help identify the issue and fix it.

At the end of the project I used Claude again to help write the unit tests and the documentation, including the README and this file.

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

---

### Prompt 3 — Unit tests for AppointmentsService

**What I asked:**
> "Write Jest unit tests for the AppointmentsService. Mock PrismaService. Cover: create throws BadRequestException for past dates, create throws ConflictException for duplicate slots, update throws ForbiddenException when userId doesn't match patientId, update throws BadRequestException for COMPLETED/CANCELLED appointments."

**What it generated:**
A full spec file with a `beforeEach` that creates a NestJS testing module with a mocked `PrismaService`. Each test case used `jest.fn()` to return specific mocked values.

---

## 4. Critical Evaluation

### Piece evaluated: Prisma setup and configuration

**What the AI got wrong:**
The AI consistently mixed solutions from different versions of Prisma. Since my project uses Prisma 7 (with the new generated client output), Claude kept suggesting patterns from older versions — for example, importing from `@prisma/client` directly instead of from the generated output path, or using deprecated configuration options. The suggestions weren't wrong in isolation, but they couldn't coexist: some lines came from Prisma 6 and others from Prisma 7, which caused the setup to break.

**What I did:**
I decided to do the Prisma setup manually instead of relying on AI-generated code for that part. I went directly to the official Prisma documentation to understand the correct configuration for the version I was using and followed it step by step.

**How I verified it:**
Running `npx prisma generate` and `npx prisma migrate deploy` without errors confirmed the setup was correct. Once the client was generating properly and the database connection worked, I used Claude for the rest of the modules.

**Lesson:**
Not everything the AI suggests is up to date. Libraries like Prisma evolve quickly and the AI's knowledge doesn't always reflect the latest version. When the generated code produces errors that don't make sense, the right move is to stop prompting and read the official docs — that's what actually unblocked me here.

---

## 5. What I Learned

**Refining prompts before using Claude Code:**
Going to Claude chat first to think through and sharpen a prompt before passing it to Claude Code made a noticeable difference in the quality of the output. A vague request produces generic code; a specific, well-scoped prompt produces something close to production-ready. This became a consistent habit throughout the project.

**AI doesn't replace reading the docs:**
As the Prisma setup showed, the AI can confidently give you outdated or mixed-version advice. I learned to recognize when something feels inconsistent and to go straight to the official documentation instead of keep prompting. That saved more time than any number of follow-up prompts would have.

**Prisma composite unique keys in `findUnique`:**
I didn't know you could use a compound key directly in `findUnique` using the auto-generated name (`doctorId_date_timeSlot`). Seeing it generated in the appointments service and then verifying it against the schema made it click.
