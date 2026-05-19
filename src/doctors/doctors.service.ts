import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const userSelect = { id: true, name: true, email: true };

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  findAll(specialty?: string) {
    return this.prisma.doctor.findMany({
      where: specialty
        ? { specialty: { contains: specialty, mode: 'insensitive' } }
        : undefined,
      include: { user: { select: userSelect } },
    });
  }

  async findOne(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: { user: { select: userSelect } },
    });
    if (!doctor) throw new NotFoundException(`Doctor with id ${id} not found`);
    return doctor;
  }
}
