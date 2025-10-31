import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Policy } from '../../policy/entities/policy.entity';
import { User } from '../../users/entities/user.entity';

@Entity('vehicle_policies')
export class VehiclePolicy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'vehicle_id' })
  vehicleId: number;

  @ManyToOne(() => Vehicle, { eager: false })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ name: 'policy_id' })
  policyId: number;

  @ManyToOne(() => Policy, { eager: false })
  @JoinColumn({ name: 'policy_id' })
  policy: Policy;

  @Column({ type: 'tinyint', default: 1 })
  state: number; // 1 = activo, 0 = inactivo

  @Column({ name: 'created_by' })
  createdBy: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'created_by' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
