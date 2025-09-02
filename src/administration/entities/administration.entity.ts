import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

@Entity('administrations')
export class Administration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: string; // YYYY-MM-DD

  @Column({ type: 'int' })
  value: number; // valor entero

  @Column({ type: 'text' })
  detail: string;

  @Column({ length: 120 })
  payer: string;

  @ManyToOne(() => Vehicle, { eager: false, nullable: false })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;
}
