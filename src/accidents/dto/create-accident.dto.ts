import { IsInt, IsNotEmpty, IsPositive, IsString, IsDateString } from 'class-validator';

export class CreateAccidentDto {
  @IsInt({ message: 'El ID del vehículo debe ser un número entero' })
  @IsPositive({ message: 'El ID del vehículo debe ser un número positivo' })
  vehicleId: number;

  @IsDateString({}, { message: 'La fecha del accidente debe ser una fecha válida (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'La fecha del accidente es requerida' })
  accidentDate: string;

  @IsString({ message: 'El detalle debe ser un texto' })
  @IsNotEmpty({ message: 'El detalle del accidente es requerido' })
  detail: string;
}
