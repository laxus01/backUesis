import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Length, MaxLength } from 'class-validator';

export class CreateAdministrationDto {
  @IsOptional()
  @IsString()
  @Length(10, 10) // YYYY-MM-DD
  date?: string;

  @IsInt()
  @IsPositive()
  value: number; // entero

  @IsString()
  @IsNotEmpty()
  detail: string;

  @IsString()
  @MaxLength(120)
  payer: string;

  @IsInt()
  @IsPositive()
  vehicleId: number;

  @IsInt()
  @IsPositive()
  userId: number;
}
