import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Driver } from "./driver.entity";

@Entity('driver_state_history')
export class DriverStateHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Driver, { eager: false, nullable: false })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @Column({ name: 'driver_id' })
  driverId: number;

  @Column({ name: 'previous_state', type: 'int' })
  previousState: number;

  @Column({ name: 'new_state', type: 'int' })
  newState: number;

  @Column({ type: 'text' })
  reason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}