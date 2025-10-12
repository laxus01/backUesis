import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Eps } from '../../eps/entities/eps.entity';
import { Arl } from '../../arl/entities/arl.entity';

@Entity('drivers')
@Unique(['identification'])
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  identification: number;

  @Column({ name: 'issued_in', length: 120, nullable: false })
  issuedIn: string; // "De" (lugar de expedición)

  @Column({ length: 120 })
  firstName: string; // Nombre

  @Column({ length: 120 })
  lastName: string; // Apellido

  @Column({ length: 20, nullable: false })
  phone: string; // Teléfono

  @Column({ length: 200, nullable: false })
  address: string; // Dirección

  @Column({ type: 'bigint' })
  license: number; // Licencia

  @Column({ length: 10, nullable: false })
  category: string; // Categoría

  @Column({ type: 'date', name: 'expires_on', nullable: false })
  expiresOn: string; // Vence (fecha)

  @Column({ length: 10, name: 'blood_type', nullable: false })
  bloodType: string; // Tipo sangre

  @Column({ name: 'photo', length: 500, nullable: false })
  photo: string; // URL de la foto del conductor

  @ManyToOne(() => Eps, { eager: false, nullable: false })
  @JoinColumn({ name: 'eps_id' })
  eps: Eps; // EPS

  @ManyToOne(() => Arl, { eager: false, nullable: false })
  @JoinColumn({ name: 'arl_id' })
  arl: Arl; // ARL
  
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'int', default: 1 })
  state: number;

}
