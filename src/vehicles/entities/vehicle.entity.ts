  import { Column, Entity, PrimaryGeneratedColumn, Unique, ManyToOne, JoinColumn } from 'typeorm';
 import { Make } from '../../make/entities/make.entity';
 import { Insurer } from '../../insurer/entities/insurer.entity';
 import { CommunicationCompany } from '../../communicationCompany/entities/communication-company.entity';
 import { Owner } from '../../owner/entities/owner.entity';
 import { Company } from '../../company/entities/company.entity';

@Entity('vehicles')
@Unique(['plate'])
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 15 })
  plate: string; // placa

  @Column({ length: 60 })
  model: string; // modelo

  // Relaciones
  @ManyToOne(() => Make, { eager: false, nullable: false })
  @JoinColumn({ name: 'make_id' })
  make: Make; // Marca

  @Column({ name: 'internal_number', length: 30, nullable: true })
  internalNumber?: string; // Numero interno

  @ManyToOne(() => Insurer, { eager: false, nullable: true })
  @JoinColumn({ name: 'insurer_id' })
  insurer?: Insurer; // Aseguradora

  @ManyToOne(() => CommunicationCompany, { eager: false, nullable: true })
  @JoinColumn({ name: 'communication_company_id' })
  communicationCompany?: CommunicationCompany; // Empresa Comunicación

  @Column({ name: 'mobile_number', length: 20, nullable: true })
  mobileNumber?: string; // Numero movil

  @ManyToOne(() => Owner, { eager: false, nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner?: Owner; // Propietario

  @ManyToOne(() => Company, { eager: false, nullable: true })
  @JoinColumn({ name: 'company_id' })
  company?: Company; // Empresa a la que pertenece

}
