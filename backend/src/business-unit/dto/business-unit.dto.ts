import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBusinessUnitDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateBusinessUnitDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
