import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

@Entity('accidents')
export class Accident {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'vehicle_id' })
  vehicleId: number;

  @ManyToOne(() => Vehicle, { eager: true, nullable: false })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ type: 'date', name: 'accident_date' })
  accidentDate: string; // Fecha del accidente

  @Column({ type: 'text' })
  detail: string; // Detalle del accidente

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
