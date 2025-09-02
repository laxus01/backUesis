import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('owners')
@Unique(['identification'])
export class Owner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 30 })
  identification: string;

  @Column({ length: 120, nullable: true })
  email?: string;

  @Column({ length: 200, nullable: true })
  address?: string;

  @Column({ length: 20 })
  phone: string;
}
