import { IsDateString, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsDateString()
  date: string;

  @IsString()
  timeSlot: string;

  @IsString()
  reason: string;

  @IsString()
  doctorId: string;
}
