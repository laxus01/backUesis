import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Insurer } from './entities/insurer.entity';
import { InsurerService } from './insurer.service';
import { InsurerController } from './insurer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Insurer])],
  providers: [InsurerService],
  controllers: [InsurerController],
  exports: [TypeOrmModule],
})
export class InsurerModule {}
