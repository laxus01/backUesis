import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn } from 'typeorm';
import { Driver } from '../../drivers/entities/driver.entity';

@Entity('driver_state_history')
export class DriverStateHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Driver, { nullable: false })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @Column({ type: 'int', name: 'previous_state', nullable: false })
  previousState: number;

  @Column({ type: 'int', name: 'new_state', nullable: false })
  newState: number;

  @Column({ type: 'text', nullable: false })
  reason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
