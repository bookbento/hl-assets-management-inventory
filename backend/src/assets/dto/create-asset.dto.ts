// backend/src/assets/dto/create-asset.dto.ts
import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsUUID,
} from "class-validator";
import { AssetCategory, AssetStatus } from "@prisma/client";

export class CreateAssetDto {
  @IsString()
  name: string;

  @IsEnum(AssetCategory)
  category: AssetCategory;

  @IsEnum(AssetStatus)
  status: AssetStatus;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsDateString()
  purchaseDate: Date;

  @IsOptional()
  @IsDateString()
  warrantyExpiry?: Date;
}
