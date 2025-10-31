import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverVehicle } from './entities/driver-vehicle.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { VehiclePolicy } from '../vehicle-policy/entities/vehicle-policy.entity';
import { DriverVehiclesService } from './driver-vehicles.service';
import { DriverVehiclesController } from './driver-vehicles.controller';
import { DriverVehiclesHistoryModule } from '../driverVehiclesHistory/driver-vehicles-history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DriverVehicle, Vehicle, VehiclePolicy]),
    DriverVehiclesHistoryModule
  ],
  controllers: [DriverVehiclesController],
  providers: [DriverVehiclesService],
  exports: [DriverVehiclesService],
})
export class DriverVehiclesModule {}
