import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { MakeService } from './make.service';
import { CreateMakeDto } from './dto/create-make.dto';
import { UpdateMakeDto } from './dto/update-make.dto';

@Controller('make')
export class MakeController {
  constructor(private readonly service: MakeService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(Number(id)); }
  @Post() create(@Body() data: CreateMakeDto) { return this.service.create(data); }
  @Put(':id') update(@Param('id') id: string, @Body() data: UpdateMakeDto) { return this.service.update(Number(id), data); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(Number(id)); }
}
