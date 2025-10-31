import { Column, Entity, PrimaryGeneratedColumn, Unique, CreateDateColumn } from 'typeorm';

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

  @Column({ name: 'manager_name', length: 200, nullable: true })
  managerName?: string;

  @Column({ name: 'manager_phone', length: 20, nullable: true })
  managerPhone?: string;
  
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
