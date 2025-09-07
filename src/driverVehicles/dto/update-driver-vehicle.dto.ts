import { IsDateString, IsOptional, IsString, Length } from 'class-validator';

export class UpdateDriverVehicleDto {
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
