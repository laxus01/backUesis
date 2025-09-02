import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique, Column } from 'typeorm';
import { Driver } from '../drivers/entities/driver.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

@Entity('drivers_vehicles')
@Unique(['driver', 'vehicle'])
export class DriverVehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Driver, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @ManyToOne(() => Vehicle, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ type: 'date', name: 'permit_expires_on', nullable: true })
  permitExpiresOn?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'note' })
  note?: string;

  // Additional fields
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
}
