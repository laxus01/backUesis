import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateOwnerDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 30)
  identification: string;

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
