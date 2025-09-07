import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './entities/driver.entity';
import { DriverVehicle } from '../driverVehicles/entities/driver-vehicle.entity';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Driver, DriverVehicle])],
  providers: [DriversService],
  controllers: [DriversController],
})
export class DriversModule {}
