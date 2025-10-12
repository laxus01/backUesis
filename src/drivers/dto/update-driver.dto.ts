import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUrl, Length, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDriverDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  identification?: number;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  issuedIn?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  lastName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  address?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  license?: number;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  category?: string;

  @IsOptional()
  @IsDateString()
  expiresOn?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  bloodType?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  epsId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  arlId?: number;

  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  @Length(1, 500)
  photo?: string;
}

// DTO para el cambio de estado
export class ToggleStateDriverDto {
  @IsString({ message: 'La razón debe ser un texto' })
  @IsNotEmpty({ message: 'La razón es requerida' })
  @MinLength(3, { message: 'La razón debe tener al menos 3 caracteres' })
  @MaxLength(255, { message: 'La razón no puede exceder 255 caracteres' })
  reason: string;
}