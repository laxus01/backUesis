import { IsInt, IsOptional, IsPositive, IsString, IsDateString } from 'class-validator';

export class UpdateAccidentDto {
  @IsOptional()
  @IsInt({ message: 'El ID del vehículo debe ser un número entero' })
  @IsPositive({ message: 'El ID del vehículo debe ser un número positivo' })
  vehicleId?: number;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha del accidente debe ser una fecha válida (YYYY-MM-DD)' })
  accidentDate?: string;

  @IsOptional()
  @IsString({ message: 'El detalle debe ser un texto' })
  detail?: string;
}
