import { IsOptional, IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryVehiclePolicyDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del vehículo debe ser un número entero' })
  @IsPositive({ message: 'El ID del vehículo debe ser positivo' })
  vehicleId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID de la póliza debe ser un número entero' })
  @IsPositive({ message: 'El ID de la póliza debe ser positivo' })
  policyId?: number;
}
