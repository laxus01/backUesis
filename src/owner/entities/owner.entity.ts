import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../../company/entities/company.entity';

@Entity('owners')
@Unique(['identification', 'company'])
export class Owner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'bigint' })
  identification: number;

  @Column({ length: 100 })
  issuedIn: string;

  @Column({ length: 120, nullable: true })
  email?: string;

  @Column({ length: 200, nullable: true })
  address?: string;

  @Column({ length: 20 })
  phone: string;

  @ManyToOne(() => Company, { eager: false, nullable: false })
  @JoinColumn({ name: 'company_id' })
  company: Company; // Empresa a la que pertenece
  
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
