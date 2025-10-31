import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Length, MaxLength, MinLength } from 'class-validator';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  @Length(1, 15)
  plate?: string;

  @IsOptional()
  @IsString()
  @Length(1, 60)
  model?: string;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  internalNumber?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  mobileNumber?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  makeId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  communicationCompanyId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  ownerId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  companyId?: number;

  @IsOptional()
  @IsString()
  @Length(1, 60)
  engineNumber?: string;

  @IsOptional()
  @IsString()
  @Length(1, 60)
  chassisNumber?: string;

  @IsOptional()
  @IsString()
  @Length(1, 60)
  line?: string;

  @IsOptional()
  @IsDateString()
  entryDate?: string;
}


// DTO para el cambio de estado
export class ToggleStateVehicleDto {
  @IsString({ message: 'La razón debe ser un texto' })
  @IsNotEmpty({ message: 'La razón es requerida' })
  @MinLength(3, { message: 'La razón debe tener al menos 3 caracteres' })
  @MaxLength(255, { message: 'La razón no puede exceder 255 caracteres' })
  reason: string;
}