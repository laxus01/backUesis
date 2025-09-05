import { IsInt, IsPositive } from 'class-validator';

export class OwnerIdDto {
  @IsInt()
  @IsPositive()
  ownerId: number;
}
