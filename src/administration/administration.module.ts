import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Administration } from './entities/administration.entity';
import { AdministrationService } from './administration.service';
import { AdministrationController } from './administration.controller';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Administration, Vehicle])],
  controllers: [AdministrationController],
  providers: [AdministrationService],
})
export class AdministrationModule {}
