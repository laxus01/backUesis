import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Administration } from './entities/administration.entity';
import { AdministrationService } from './administration.service';
import { AdministrationController } from './administration.controller';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Administration]), VehiclesModule, UsersModule],
  controllers: [AdministrationController],
  providers: [AdministrationService],
})
export class AdministrationModule {}
