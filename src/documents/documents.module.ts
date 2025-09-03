import { Module } from '@nestjs/common';
import { OwnerModule } from '../owner/owner.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [OwnerModule, VehiclesModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
