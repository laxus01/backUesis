import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateMakeDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  name: string;
}
