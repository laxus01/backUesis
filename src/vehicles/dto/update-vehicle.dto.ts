import { IsInt, IsOptional, IsPositive, IsString, Length } from 'class-validator';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  @Length(1, 15)
   plate?: string;

   @IsOptional()
   @IsString()
   @Length(1, 60)
   model?: string;

   @IsOptional()
   @IsString()
   @Length(1, 30)
   internalNumber?: string;

   @IsOptional()
   @IsString()
   @Length(1, 20)
   mobileNumber?: string;

   @IsOptional()
   @IsInt()
   @IsPositive()
   makeId?: number;

   @IsOptional()
   @IsInt()
   @IsPositive()
   insurerId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  communicationCompanyId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  ownerId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  companyId?: number;
}
