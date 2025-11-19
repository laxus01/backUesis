import { IsOptional, IsString, IsInt, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryDriverVehicleHistoryDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  driverId?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  vehicleId?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  originalRecordId?: number;

  @IsOptional()
  @IsString()
  actionType?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  // Rango de fechas para vencimientos específicos (startDate/endDate)
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  changedBy?: string;

  @IsOptional()
  @IsString()
  fieldName?: string;
}
