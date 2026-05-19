import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: '2026-06-01' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '10:00' })
  @IsString()
  timeSlot: string;

  @ApiProperty({ example: 'Routine checkup' })
  @IsString()
  reason: string;

  @ApiProperty({ example: 'doctor-uuid-here' })
  @IsString()
  doctorId: string;
}
