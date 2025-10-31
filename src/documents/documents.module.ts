import { Module } from '@nestjs/common';
import { OwnerModule } from '../owner/owner.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { DriversModule } from '../drivers/drivers.module';
import { CompanyModule } from '../company/company.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [OwnerModule, VehiclesModule, DriversModule, CompanyModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
