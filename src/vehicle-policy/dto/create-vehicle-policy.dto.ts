import { IsInt, IsPositive } from 'class-validator';

export class CreateVehiclePolicyDto {
  @IsInt({ message: 'El ID del vehículo debe ser un número entero' })
  @IsPositive({ message: 'El ID del vehículo debe ser positivo' })
  vehicleId: number;

  @IsInt({ message: 'El ID de la póliza debe ser un número entero' })
  @IsPositive({ message: 'El ID de la póliza debe ser positivo' })
  policyId: number;

  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @IsPositive({ message: 'El ID del usuario debe ser positivo' })
  createdBy: number;
}
