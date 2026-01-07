import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateReasonDto {
  @IsNotEmpty()
  @IsString()
  reason: string;
}
