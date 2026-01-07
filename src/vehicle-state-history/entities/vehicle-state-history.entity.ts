import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn } from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

@Entity('vehicle_state_history')
export class VehicleStateHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Vehicle, { nullable: false })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ type: 'int', name: 'previous_state', nullable: false })
  previousState: number;

  @Column({ type: 'int', name: 'new_state', nullable: false })
  newState: number;

  @Column({ type: 'text', nullable: false })
  reason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
