import { IsEnum } from 'class-validator';
import { AppointmentStatus } from '../../generated/prisma/client.js';

export class UpdateAppointmentDto {
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}
