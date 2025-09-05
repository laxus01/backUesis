import { IsDateString, IsInt, IsNotEmpty, IsPositive, IsString, IsUrl, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDriverDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  identification: number;

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

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  license: number;

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
