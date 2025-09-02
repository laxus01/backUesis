import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ArlService } from './arl.service';
import { CreateArlDto } from './dto/create-arl.dto';
import { UpdateArlDto } from './dto/update-arl.dto';

@Controller('arl')
export class ArlController {
  constructor(private readonly service: ArlService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(Number(id)); }
  @Post() create(@Body() data: CreateArlDto) { return this.service.create(data); }
  @Put(':id') update(@Param('id') id: string, @Body() data: UpdateArlDto) { return this.service.update(Number(id), data); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(Number(id)); }
}
