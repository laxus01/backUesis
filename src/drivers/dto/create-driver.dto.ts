import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUrl, Length } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 30)
  identification: string;

  @IsString()
  @Length(1, 120)
  issuedIn: string; // "De"

  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  lastName: string;

  @IsString()
  @Length(1, 20)
  phone: string;

  @IsString()
  @Length(1, 200)
  address: string;

  @IsString()
  @Length(1, 60)
  license: string;

  @IsString()
  @Length(1, 10)
  category: string;

  @IsDateString()
  expiresOn: string;

  @IsString()
  @Length(1, 10)
  bloodType: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  @Length(1, 500)
  photo: string;

  @IsInt()
  @IsPositive()
  epsId: number;

  @IsInt()
  @IsPositive()
  arlId: number;
}
