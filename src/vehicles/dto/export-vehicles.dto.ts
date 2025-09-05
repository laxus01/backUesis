import { IsArray, IsNumber } from 'class-validator';

export class ExportVehiclesByIdsDto {
  @IsArray()
  @IsNumber({}, { each: true })
  vehicleIds: number[];
}
