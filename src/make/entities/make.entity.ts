import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('makes')
@Unique(['name'])
export class Make {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;
}
