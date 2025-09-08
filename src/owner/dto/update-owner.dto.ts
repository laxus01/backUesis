import { IsEmail, IsInt, IsOptional, IsPositive, IsString, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOwnerDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  identification?: number;

  @IsOptional()
  @IsEmail()
  @Length(1, 120)
  email?: string;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  companyId?: number;
}
