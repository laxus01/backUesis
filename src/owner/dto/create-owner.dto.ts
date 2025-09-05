import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOwnerDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  name: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  identification: number;

  @IsOptional()
  @IsEmail()
  @Length(1, 120)
  email?: string;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  address?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  phone: string;
}
