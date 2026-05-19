import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.appointment.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // Doctors
  const anaUser = await prisma.user.create({
    data: {
      name: 'Dr. Ana Torres',
      email: 'ana.torres@medibook.com',
      password: await hash('password123'),
      role: 'DOCTOR',
      doctor: { create: { specialty: 'Cardiology' } },
    },
    include: { doctor: true },
  });

  const carlosUser = await prisma.user.create({
    data: {
      name: 'Dr. Carlos Méndez',
      email: 'carlos.mendez@medibook.com',
      password: await hash('password123'),
      role: 'DOCTOR',
      doctor: { create: { specialty: 'Neurology' } },
    },
    include: { doctor: true },
  });

  const sofiaUser = await prisma.user.create({
    data: {
      name: 'Dr. Sofía Ramírez',
      email: 'sofia.ramirez@medibook.com',
      password: await hash('password123'),
      role: 'DOCTOR',
      doctor: { create: { specialty: 'Pediatrics' } },
    },
    include: { doctor: true },
  });

  // Patients
  const patient1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: await hash('password123'),
      role: 'PATIENT',
    },
  });

  const patient2 = await prisma.user.create({
    data: {
      name: 'Maria García',
      email: 'maria@example.com',
      password: await hash('password123'),
      role: 'PATIENT',
    },
  });

  // Appointments
  await prisma.appointment.createMany({
    data: [
      {
        date: new Date('2026-06-01'),
        timeSlot: '10:00',
        reason: 'Routine checkup',
        status: 'PENDING',
        patientId: patient1.id,
        doctorId: anaUser.doctor!.id,
      },
      {
        date: new Date('2026-06-02'),
        timeSlot: '11:00',
        reason: 'Headache evaluation',
        status: 'CONFIRMED',
        patientId: patient2.id,
        doctorId: carlosUser.doctor!.id,
      },
      {
        date: new Date('2026-06-03'),
        timeSlot: '09:00',
        reason: 'Child annual checkup',
        status: 'PENDING',
        patientId: patient1.id,
        doctorId: sofiaUser.doctor!.id,
      },
    ],
  });

  console.log('Seed completed:');
  console.log('  Doctors : ana.torres@medibook.com / carlos.mendez@medibook.com / sofia.ramirez@medibook.com');
  console.log('  Patients: john@example.com / maria@example.com');
  console.log('  Password for all: password123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
