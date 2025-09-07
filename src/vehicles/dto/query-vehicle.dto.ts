import { IsOptional, IsString } from 'class-validator';

export class QueryVehicleDto {
  @IsOptional()
  @IsString()
  plate?: string;
}
