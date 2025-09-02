import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('eps')
@Unique(['name'])
export class Eps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;
}
