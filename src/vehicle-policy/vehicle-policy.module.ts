import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclePolicyService } from './vehicle-policy.service';
import { VehiclePolicyController } from './vehicle-policy.controller';
import { VehiclePolicy } from './entities/vehicle-policy.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Policy } from '../policy/entities/policy.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([VehiclePolicy, Vehicle, Policy, User]),
  ],
  controllers: [VehiclePolicyController],
  providers: [VehiclePolicyService],
  exports: [TypeOrmModule, VehiclePolicyService],
})
export class VehiclePolicyModule {}
