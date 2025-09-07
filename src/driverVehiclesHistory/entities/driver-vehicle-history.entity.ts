import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn } from 'typeorm';
import { Driver } from '../../drivers/entities/driver.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

@Entity('drivers_vehicles_history')
export class DriverVehicleHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Driver, { nullable: false })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @ManyToOne(() => Vehicle, { nullable: false })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ type: 'int', name: 'original_record_id', nullable: false })
  originalRecordId: number;

  @Column({ type: 'date', name: 'permit_expires_on', nullable: true })
  permitExpiresOn?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'note' })
  note?: string;

  @Column({ type: 'varchar', length: 60, nullable: true, name: 'soat' })
  soat?: string;

  @Column({ type: 'date', nullable: true, name: 'soat_expires_on' })
  soatExpires?: string;

  @Column({ type: 'varchar', length: 60, nullable: true, name: 'operation_card' })
  operationCard?: string;

  @Column({ type: 'date', nullable: true, name: 'operation_card_expires_on' })
  operationCardExpires?: string;

  @Column({ type: 'date', nullable: true, name: 'contractual_expires_on' })
  contractualExpires?: string;

  @Column({ type: 'date', nullable: true, name: 'extra_contractual_expires_on' })
  extraContractualExpires?: string;

  @Column({ type: 'date', nullable: true, name: 'technical_mechanic_expires_on' })
  technicalMechanicExpires?: string;

  @Column({ type: 'datetime', name: 'original_created_at', nullable: false })
  originalCreatedAt: Date;

  @Column({ type: 'datetime', name: 'original_updated_at', nullable: false })
  originalUpdatedAt: Date;

  @Column({ type: 'varchar', length: 50, name: 'action_type', nullable: false })
  actionType: string; // 'UPDATE', 'DELETE', etc.

  @Column({ type: 'varchar', length: 100, name: 'changed_by', nullable: true })
  changedBy?: string; // Usuario que realizó el cambio

  @CreateDateColumn({ name: 'history_created_at' })
  historyCreatedAt: Date;
}
