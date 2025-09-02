import { IsInt, Min } from 'class-validator';

export class VehicleIdDto {
  @IsInt()
  @Min(1)
  vehicleId: number;
}
