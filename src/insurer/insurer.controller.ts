import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { InsurerService } from './insurer.service';
import { CreateInsurerDto } from './dto/create-insurer.dto';
import { UpdateInsurerDto } from './dto/update-insurer.dto';

@Controller('insurer')
export class InsurerController {
  constructor(private readonly service: InsurerService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(Number(id)); }
  @Post() create(@Body() data: CreateInsurerDto) { return this.service.create(data); }
  @Put(':id') update(@Param('id') id: string, @Body() data: UpdateInsurerDto) { return this.service.update(Number(id), data); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(Number(id)); }
}
