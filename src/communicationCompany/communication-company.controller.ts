import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { CommunicationCompanyService } from './communication-company.service';
import { CreateCommunicationCompanyDto } from './dto/create-communication-company.dto';
import { UpdateCommunicationCompanyDto } from './dto/update-communication-company.dto';

@Controller('communication-company')
export class CommunicationCompanyController {
  constructor(private readonly service: CommunicationCompanyService) { }

  @Get()
  findAll() {
    return this.service.findAll();
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
  @Post()
  create(@Body() data: CreateCommunicationCompanyDto) {
    return this.service.create(data);
  }
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateCommunicationCompanyDto) {
    return this.service.update(id, data);
  }
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
