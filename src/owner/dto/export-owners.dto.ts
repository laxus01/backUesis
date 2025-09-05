import { IsArray, IsNumber } from 'class-validator';

export class ExportOwnersByIdsDto {
  @IsArray()
  @IsNumber({}, { each: true })
  ownerIds: number[];
}
