import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateArlDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;
}
