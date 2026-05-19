import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum Role {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
}

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.PATIENT;

  @IsOptional()
  @IsString()
  specialty?: string;
}
