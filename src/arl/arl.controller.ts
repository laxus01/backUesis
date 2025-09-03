import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ArlService } from './arl.service';
import { CreateArlDto } from './dto/create-arl.dto';
import { UpdateArlDto } from './dto/update-arl.dto';

@Controller('arl')
export class ArlController {
  constructor(private readonly service: ArlService) { }

  @Get()
  findAll() {
    return this.service.findAll();
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
  @Post()
  create(@Body() data: CreateArlDto) {
    return this.service.create(data);
  }
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateArlDto) {
    return this.service.update(id, data);
  }
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
