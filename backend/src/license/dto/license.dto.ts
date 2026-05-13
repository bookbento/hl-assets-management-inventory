import { LicenseStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateLicenseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  vendor: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsInt()
  @Min(1)
  totalSeats: number;

  @IsEnum(LicenseStatus)
  @IsOptional()
  status?: LicenseStatus;

  @IsDateString()
  @IsNotEmpty()
  expiryDate: string;

  @IsString()
  @IsNotEmpty()
  price: string;

  @IsString()
  @IsNotEmpty()
  billingCycle: string;

  @IsString()
  @IsNotEmpty()
  annualCost: string;

  @IsString()
  @IsOptional()
  color?: string;
}

export class UpdateLicenseDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  vendor?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  totalSeats?: number;

  @IsEnum(LicenseStatus)
  @IsOptional()
  status?: LicenseStatus;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  price?: string;

  @IsString()
  @IsOptional()
  billingCycle?: string;

  @IsString()
  @IsOptional()
  annualCost?: string;

  @IsString()
  @IsOptional()
  color?: string;
}

export class AssignLicenseDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;
}

export class UnassignLicenseDto {
  @IsString()
  @IsNotEmpty()
  assignmentId: string;
}
