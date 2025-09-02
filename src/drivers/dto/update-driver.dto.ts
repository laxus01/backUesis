import { IsDateString, IsInt, IsOptional, IsPositive, IsString, IsUrl, Length } from 'class-validator';

export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  @Length(1, 30)
  identification?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  issuedIn?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  lastName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(1, 60)
  license?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  category?: string;

  @IsOptional()
  @IsDateString()
  expiresOn?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  bloodType?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  epsId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  arlId?: number;

  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  @Length(1, 500)
  photo?: string;
}
