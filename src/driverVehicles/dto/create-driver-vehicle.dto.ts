import { IsDateString, IsInt, IsOptional, IsPositive, IsString, Length } from 'class-validator';

export class CreateDriverVehicleDto {
  @IsInt()
  @IsPositive()
  driverId: number;

  @IsInt()
  @IsPositive()
  vehicleId: number;

  @IsOptional()
  @IsDateString()
  permitExpiresOn?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  note?: string;

  @IsOptional()
  @IsString()
  @Length(0, 60)
  soat?: string;

  @IsOptional()
  @IsDateString()
  soatExpires?: string;

  @IsOptional()
  @IsString()
  @Length(0, 60)
  operationCard?: string;

  @IsOptional()
  @IsDateString()
  operationCardExpires?: string;

  @IsOptional()
  @IsDateString()
  contractualExpires?: string;

  @IsOptional()
  @IsDateString()
  extraContractualExpires?: string;

  @IsOptional()
  @IsDateString()
  technicalMechanicExpires?: string;
}
