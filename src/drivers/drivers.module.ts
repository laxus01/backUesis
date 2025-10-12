import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './entities/driver.entity';
import { DriverStateHistory } from './entities/driver-state-history';
import { DriverVehicle } from '../driverVehicles/entities/driver-vehicle.entity';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Driver, DriverStateHistory, DriverVehicle])],
  providers: [DriversService],
  controllers: [DriversController],
})
export class DriversModule {}
