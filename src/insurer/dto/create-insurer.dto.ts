import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateInsurerDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  name: string;
}
