import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Especificar el archivo de variables de entorno
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_DATABASE', 'uesis'),
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') === 'development',
        retryAttempts: 10,
        retryDelay: 3000,
      }),
      inject: [ConfigService],
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
