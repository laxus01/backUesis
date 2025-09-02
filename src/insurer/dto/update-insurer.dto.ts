import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateInsurerDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;
}
