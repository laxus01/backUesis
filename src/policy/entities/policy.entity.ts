import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Insurer } from '../../insurer/entities/insurer.entity';
import { Company } from '../../company/entities/company.entity';

@Entity('policies')
export class Policy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'insurer_id' })
  insurerId: number;

  @ManyToOne(() => Insurer, { eager: true })
  @JoinColumn({ name: 'insurer_id' })
  insurer: Insurer;

  @Column({ name: 'company_id' })
  companyId: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ length: 200, nullable: true })
  contractual?: string;

  @Column({ type: 'date', name: 'contractual_expires', nullable: true })
  contractualExpires?: string;

  @Column({ length: 200, nullable: true })
  extraContractual?: string;

  @Column({ type: 'date', name: 'extra_contractual_expires', nullable: true })
  extraContractualExpires?: string;

  @Column({ type: 'tinyint', default: 1 })
  state: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
