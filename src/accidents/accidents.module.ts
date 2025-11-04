import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Accident } from './entities/accident.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { AccidentsService } from './accidents.service';
import { AccidentsController } from './accidents.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Accident, Vehicle])],
  controllers: [AccidentsController],
  providers: [AccidentsService],
  exports: [AccidentsService],
})
export class AccidentsModule {}
