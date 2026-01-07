import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverStateHistory } from './entities/driver-state-history.entity';
import { DriverStateHistoryService } from './driver-state-history.service';
import { DriverStateHistoryController } from './driver-state-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DriverStateHistory])],
  controllers: [DriverStateHistoryController],
  providers: [DriverStateHistoryService],
  exports: [DriverStateHistoryService],
})
export class DriverStateHistoryModule {}
