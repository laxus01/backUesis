import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { OwnerModule } from './owner/owner.module';
import { CommunicationCompanyModule } from './communicationCompany/communication-company.module';
import { InsurerModule } from './insurer/insurer.module';
import { MakeModule } from './make/make.module';
import { EpsModule } from './eps/eps.module';
import { ArlModule } from './arl/arl.module';
import { DriversModule } from './drivers/drivers.module';
import { CompanyModule } from './company/company.module';
import { UploadsModule } from './uploads/uploads.module';
import { DriverVehiclesModule } from './driverVehicles/driver-vehicles.module';
import { DriverVehiclesHistoryModule } from './driverVehiclesHistory/driver-vehicles-history.module';
import { AdministrationModule } from './administration/administration.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT) || 3306,
      username: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME || 'uesis',
      autoLoadEntities: true,
      synchronize: true,
      retryAttempts: 10,
      retryDelay: 3000,
    }),
    AuthModule,
    UsersModule,
    VehiclesModule,
    OwnerModule,
    CommunicationCompanyModule,
    InsurerModule,
    MakeModule,
    EpsModule,
    ArlModule,
    DriversModule,
    CompanyModule,
    UploadsModule,
    DriverVehiclesModule,
    DriverVehiclesHistoryModule,
    AdministrationModule,
    DocumentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
