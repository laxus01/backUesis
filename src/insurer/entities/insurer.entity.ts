import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('insurers')
@Unique(['name'])
export class Insurer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;
}
