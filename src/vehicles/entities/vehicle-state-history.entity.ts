import { CreateDateColumn, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Vehicle } from "./vehicle.entity";

@Entity('vehicle_state_history')
export class VehicleStateHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Vehicle, { eager: false, nullable: false })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ name: 'vehicle_id' })
  vehicleId: number;

  @Column({ name: 'previous_state', type: 'int' })
  previousState: number;

  @Column({ name: 'new_state', type: 'int' })
  newState: number;

  @Column({ type: 'text' })
  reason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}