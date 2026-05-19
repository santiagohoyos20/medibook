import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('App E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let patientToken: string;
  let doctorId: string;
  let appointmentId: string;

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  const futureDateStr = futureDate.toISOString().split('T')[0];
  const timeSlot = '10:00';

  const patientData = {
    name: 'E2E Patient',
    email: 'patient.e2e@test.com',
    password: 'password123',
    role: 'PATIENT',
  };

  const doctorData = {
    name: 'E2E Doctor',
    email: 'doctor.e2e@test.com',
    password: 'password123',
    role: 'DOCTOR',
    specialty: 'General Medicine',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.appointment.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('1. REGISTER — registers a patient and a doctor, saves token and doctorId', async () => {
    const patientRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(patientData)
      .expect(201);

    expect(patientRes.body).toHaveProperty('accessToken');
    patientToken = patientRes.body.accessToken;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(doctorData)
      .expect(201);

    const doctorsRes = await request(app.getHttpServer())
      .get('/doctors')
      .expect(200);

    const doctor = doctorsRes.body.find(
      (d: any) => d.user.email === doctorData.email,
    );
    expect(doctor).toBeDefined();
    doctorId = doctor.id;
  });

  it('2. LOGIN — logs in with patient credentials and returns a valid access_token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: patientData.email, password: patientData.password })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(typeof res.body.accessToken).toBe('string');
    expect(res.body.accessToken.split('.').length).toBe(3);
  });

  it('3. CREATE APPOINTMENT — creates a future appointment and returns 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId,
        date: futureDateStr,
        timeSlot,
        reason: 'Routine checkup',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    appointmentId = res.body.id;
  });

  it('4. GET APPOINTMENTS — patient only sees their own appointments', async () => {
    const res = await request(app.getHttpServer())
      .get('/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(appointmentId);
  });

  it('5. CONFLICT — same doctorId + date + timeSlot returns 409', async () => {
    await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId,
        date: futureDateStr,
        timeSlot,
        reason: 'Duplicate appointment',
      })
      .expect(409);
  });

  it('6. PAST DATE — appointment with a past date returns 400', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const pastDateStr = pastDate.toISOString().split('T')[0];

    await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId,
        date: pastDateStr,
        timeSlot: '09:00',
        reason: 'Should be rejected',
      })
      .expect(400);
  });
});
