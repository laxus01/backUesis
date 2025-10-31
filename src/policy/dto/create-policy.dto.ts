import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Length } from 'class-validator';

export class CreatePolicyDto {
  @IsInt({ message: 'El ID de la aseguradora debe ser un número entero' })
  @IsPositive({ message: 'El ID de la aseguradora debe ser un número positivo' })
  @IsNotEmpty({ message: 'El ID de la aseguradora es requerido' })
  insurerId: number;

  @IsOptional()
  @IsInt({ message: 'El ID de la compañía debe ser un número entero' })
  @IsPositive({ message: 'El ID de la compañía debe ser un número positivo' })
  companyId?: number;

  @IsOptional()
  @IsString({ message: 'El campo contractual debe ser una cadena de texto' })
  @Length(1, 200, { message: 'El campo contractual debe tener entre 1 y 200 caracteres' })
  contractual?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de expiración contractual debe ser una fecha válida' })
  contractualExpires?: string;

  @IsOptional()
  @IsString({ message: 'El campo extraContractual debe ser una cadena de texto' })
  @Length(1, 200, { message: 'El campo extraContractual debe tener entre 1 y 200 caracteres' })
  extraContractual?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de expiración extraContractual debe ser una fecha válida' })
  extraContractualExpires?: string;
}
