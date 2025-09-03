import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { CreateManyDriversPipe } from './pipes/create-many-drivers.pipe';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Controller('drivers')
export class DriversController {
  constructor(private readonly service: DriversService) { }

  @Get()
  find(@Query('identification') identification?: string) {
    if (identification) {
      return this.service.searchByIdentification(identification.trim());
    }
    return this.service.findAll();
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
  @Post() create(@Body() data: CreateDriverDto) { return this.service.create(data); }
  @Post('bulk')
  createMany(@Body(CreateManyDriversPipe) data: CreateDriverDto[]) {
    return this.service.createMany(data);
  }
  @Put(':id') update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateDriverDto) { return this.service.update(id, data); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
