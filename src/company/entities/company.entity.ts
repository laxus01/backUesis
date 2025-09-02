import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('companies')
@Unique(['nit'])
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30 })
  nit: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ length: 200, nullable: true })
  address?: string;
}
