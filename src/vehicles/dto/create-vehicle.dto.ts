import { IsInt, IsNotEmpty, IsPositive, IsString, Length } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 15)
  plate: string; // placa

  @IsString()
  @IsNotEmpty()
  @Length(1, 60)
  model: string; // modelo

  @IsString()
  @IsNotEmpty()
  @Length(1, 30)
  internalNumber: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  mobileNumber: string;

  @IsInt()
  @IsPositive()
  makeId: number;

  @IsInt()
  @IsPositive()
  insurerId: number;

  @IsInt()
  @IsPositive()
  communicationCompanyId: number;

  @IsInt()
  @IsPositive()
  ownerId: number;

  @IsInt()
  @IsPositive()
  companyId: number;
}
