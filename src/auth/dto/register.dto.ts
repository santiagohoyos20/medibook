import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum Role {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
}

export class RegisterDto {
  @ApiProperty({ example: 'Dr. Ana Torres' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'ana.torres@medibook.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ enum: Role, default: Role.DOCTOR })
  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.PATIENT;

  @ApiPropertyOptional({ example: 'Cardiology' })
  @IsOptional()
  @IsString()
  specialty?: string;
}
