import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Eps } from './entities/eps.entity';
import { EpsService } from './eps.service';
import { EpsController } from './eps.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Eps])],
  providers: [EpsService],
  controllers: [EpsController],
})
export class EpsModule {}
