import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleStateHistory } from './entities/vehicle-state-history.entity';
import { DriverVehicle } from '../driverVehicles/entities/driver-vehicle.entity';
import { VehiclePolicy } from '../vehicle-policy/entities/vehicle-policy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, VehicleStateHistory, DriverVehicle, VehiclePolicy])],
  providers: [VehiclesService],
  controllers: [VehiclesController],
  exports: [TypeOrmModule, VehiclesService],
})
export class VehiclesModule {}
