import { IsOptional, IsString, Length, IsDateString } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @Length(1, 30)
  nit: string;

  @IsString()
  @Length(1, 200)
  name: string;

  @IsOptional()
  @IsString()
  @Length(0, 20)
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  contractual?: string;

  @IsOptional()
  @IsDateString()
  contractualExpires?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  extraContractual?: string;

  @IsOptional()
  @IsDateString()
  extraContractualExpires?: string;
}
