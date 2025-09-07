import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Owner } from './entities/owner.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { OwnerService } from './owner.service';
import { OwnerController } from './owner.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Owner, Vehicle])],
  providers: [OwnerService],
  controllers: [OwnerController],
  exports: [TypeOrmModule, OwnerService],
})
export class OwnerModule {}
