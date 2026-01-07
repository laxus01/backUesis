import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleStateHistory } from './entities/vehicle-state-history.entity';
import { VehicleStateHistoryService } from './vehicle-state-history.service';
import { VehicleStateHistoryController } from './vehicle-state-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleStateHistory])],
  controllers: [VehicleStateHistoryController],
  providers: [VehicleStateHistoryService],
  exports: [VehicleStateHistoryService],
})
export class VehicleStateHistoryModule {}
