import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';

@Controller('owner')
export class OwnerController {
  constructor(private readonly service: OwnerService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(Number(id)); }
  @Post() create(@Body() data: CreateOwnerDto) { return this.service.create(data); }
  @Put(':id') update(@Param('id') id: string, @Body() data: UpdateOwnerDto) { return this.service.update(Number(id), data); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(Number(id)); }
}
