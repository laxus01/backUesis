import { IsString, Length } from 'class-validator';

export class DateRangeDto {
  @IsString()
  @Length(10, 10) // YYYY-MM-DD
  startDate: string;

  @IsString()
  @Length(10, 10) // YYYY-MM-DD
  endDate: string;
}
