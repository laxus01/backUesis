import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOwnerDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  name: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  identification: number;

  @IsString({ message: 'El lugar de expedición debe ser un texto' })
  @IsNotEmpty({ message: 'El lugar de expedición es obligatorio' })
  @Length(1, 100, { message: 'El lugar de expedición debe tener entre 1 y 100 caracteres' })
  issuedIn: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser válido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser un texto' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un texto' })
  phone?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  companyId?: number;
}
