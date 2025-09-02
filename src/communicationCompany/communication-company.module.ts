import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunicationCompany } from './entities/communication-company.entity';
import { CommunicationCompanyService } from './communication-company.service';
import { CommunicationCompanyController } from './communication-company.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CommunicationCompany])],
  providers: [CommunicationCompanyService],
  controllers: [CommunicationCompanyController],
  exports: [TypeOrmModule],
})
export class CommunicationCompanyModule {}
