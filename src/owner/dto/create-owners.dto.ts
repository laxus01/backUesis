import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateOwnerDto } from './create-owner.dto';

export class CreateOwnersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOwnerDto)
  owners: CreateOwnerDto[];
}
