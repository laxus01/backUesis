import { IsArray, IsNumber } from 'class-validator';

export class ExportDriversByIdsDto {
  @IsArray()
  @IsNumber({}, { each: true })
  driverIds: number[];
}
