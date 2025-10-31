import { IsInt, IsPositive, IsOptional } from 'class-validator';

export class UpdateVehiclePolicyDto {
  @IsOptional()
  @IsInt({ message: 'El ID del vehículo debe ser un número entero' })
  @IsPositive({ message: 'El ID del vehículo debe ser positivo' })
  vehicleId?: number;

  @IsOptional()
  @IsInt({ message: 'El ID de la póliza debe ser un número entero' })
  @IsPositive({ message: 'El ID de la póliza debe ser positivo' })
  policyId?: number;
}
