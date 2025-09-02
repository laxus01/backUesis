import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Arl } from './entities/arl.entity';
import { ArlService } from './arl.service';
import { ArlController } from './arl.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Arl])],
  providers: [ArlService],
  controllers: [ArlController],
})
export class ArlModule {}
