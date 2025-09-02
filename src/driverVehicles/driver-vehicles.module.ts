import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverVehicle } from './driver-vehicle.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { DriverVehiclesService } from './driver-vehicles.service';
import { DriverVehiclesController } from './driver-vehicles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DriverVehicle, Vehicle])],
  controllers: [DriverVehiclesController],
  providers: [DriverVehiclesService],
  exports: [DriverVehiclesService],
})
export class DriverVehiclesModule {}
