import { IsOptional, IsInt, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryDriverStateHistoryDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  driverId?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  previousState?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  newState?: number;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}
