import { LicenseStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
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

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsNotEmpty()
  billingCycle: string;

  @IsNumber()
  @IsNotEmpty()
  annualCost: number;

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

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  billingCycle?: string;

  @IsNumber()
  @IsOptional()
  annualCost?: number;

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
