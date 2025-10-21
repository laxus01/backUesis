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

  @Column({ length: 200, nullable: true })
  contractual?: string;

  @Column({ type: 'date', name: 'contractual_expires', nullable: true })
  contractualExpires: string; 

  @Column({ length: 200, nullable: true })
  extraContractual?: string;

  @Column({ type: 'date', name: 'extra_contractual_expires', nullable: true })
  extraContractualExpires: string; 
  
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
