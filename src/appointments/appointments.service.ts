import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { UpdateAppointmentDto } from './dto/update-appointment.dto.js';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAppointmentDto, patientId: string) {
    const appointmentDate = new Date(dto.date);
    if (appointmentDate < new Date()) {
      throw new BadRequestException('Appointment date cannot be in the past');
    }

    const doctor = await this.prisma.doctor.findUnique({
      where: { id: dto.doctorId },
    });
    if (!doctor) {
      throw new NotFoundException(`Doctor with id ${dto.doctorId} not found`);
    }

    const conflict = await this.prisma.appointment.findUnique({
      where: {
        doctorId_date_timeSlot: {
          doctorId: dto.doctorId,
          date: appointmentDate,
          timeSlot: dto.timeSlot,
        },
      },
    });
    if (conflict) {
      throw new ConflictException(
        'This time slot is already booked for the selected doctor',
      );
    }

    return this.prisma.appointment.create({
      data: {
        date: appointmentDate,
        timeSlot: dto.timeSlot,
        reason: dto.reason,
        doctorId: dto.doctorId,
        patientId,
      },
    });
  }

  findAll(patientId: string) {
    return this.prisma.appointment.findMany({
      where: { patientId },
    });
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment with id ${id} not found`);
    }
    return appointment;
  }

  async update(id: string, dto: UpdateAppointmentDto, userId: string) {
    const appointment = await this.findOne(id);

    if (appointment.patientId !== userId) {
      throw new ForbiddenException('You can only edit your own appointments');
    }

    if (
      appointment.status === AppointmentStatus.COMPLETED ||
      appointment.status === AppointmentStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cannot update a completed or cancelled appointment',
      );
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async remove(id: string, userId: string) {
    const appointment = await this.findOne(id);

    if (appointment.patientId !== userId) {
      throw new ForbiddenException('You can only cancel your own appointments');
    }

    return this.prisma.appointment.delete({ where: { id } });
  }
}
