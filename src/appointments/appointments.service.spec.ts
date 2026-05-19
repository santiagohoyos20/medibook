import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AppointmentStatus } from '../generated/prisma/enums.js';
import { AppointmentsService } from './appointments.service.js';

const mockPrisma = {
  appointment: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('AppointmentsService', () => {
  let service: AppointmentsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AppointmentsService(mockPrisma as any);
  });

  describe('create', () => {
    it('lanza BadRequestException si la fecha de la cita es en el pasado', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      await expect(
        service.create(
          { date: pastDate, timeSlot: '09:00', reason: 'Checkup', doctorId: 'doc-1' },
          'patient-1',
        ),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrisma.appointment.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('lanza ForbiddenException si el paciente intenta editar una cita ajena', async () => {
      mockPrisma.appointment.findUnique.mockResolvedValue({
        id: 'appt-1',
        patientId: 'owner-patient',
        status: AppointmentStatus.PENDING,
      });

      await expect(
        service.update('appt-1', { status: AppointmentStatus.CANCELLED }, 'other-patient'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('lanza BadRequestException si la cita tiene status COMPLETED', async () => {
      mockPrisma.appointment.findUnique.mockResolvedValue({
        id: 'appt-2',
        patientId: 'patient-1',
        status: AppointmentStatus.COMPLETED,
      });

      await expect(
        service.update('appt-2', { status: AppointmentStatus.CANCELLED }, 'patient-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
