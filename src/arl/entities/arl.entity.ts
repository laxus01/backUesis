import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('arls')
@Unique(['name'])
export class Arl {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;
}
