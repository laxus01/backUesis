import { IsInt, IsOptional, IsPositive, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryAccidentDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del vehículo debe ser un número entero' })
  @IsPositive({ message: 'El ID del vehículo debe ser un número positivo' })
  vehicleId?: number;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha inicial debe ser una fecha válida (YYYY-MM-DD)' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha final debe ser una fecha válida (YYYY-MM-DD)' })
  endDate?: string;
}
