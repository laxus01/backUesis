import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Make } from './entities/make.entity';
import { MakeService } from './make.service';
import { MakeController } from './make.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Make])],
  providers: [MakeService],
  controllers: [MakeController],
  exports: [TypeOrmModule],
})
export class MakeModule {}
