import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverVehicleHistory } from './entities/driver-vehicle-history.entity';
import { DriverVehiclesHistoryService } from './driver-vehicles-history.service';
import { DriverVehiclesHistoryController } from './driver-vehicles-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DriverVehicleHistory])],
  controllers: [DriverVehiclesHistoryController],
  providers: [DriverVehiclesHistoryService],
  exports: [DriverVehiclesHistoryService],
})
export class DriverVehiclesHistoryModule {}
