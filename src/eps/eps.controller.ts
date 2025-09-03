import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { EpsService } from './eps.service';
import { CreateEpsDto } from './dto/create-eps.dto';
import { UpdateEpsDto } from './dto/update-eps.dto';

@Controller('eps')
export class EpsController {
  constructor(private readonly service: EpsService) { }

  @Get()
  findAll() {
    return this.service.findAll();
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
  @Post()
  create(@Body() data: CreateEpsDto) {
    return this.service.create(data);
  }
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateEpsDto) {
    return this.service.update(id, data);
  }
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
