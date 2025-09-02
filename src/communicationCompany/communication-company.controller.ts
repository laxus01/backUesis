import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CommunicationCompanyService } from './communication-company.service';
import { CreateCommunicationCompanyDto } from './dto/create-communication-company.dto';
import { UpdateCommunicationCompanyDto } from './dto/update-communication-company.dto';

@Controller('communication-company')
export class CommunicationCompanyController {
  constructor(private readonly service: CommunicationCompanyService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(Number(id)); }
  @Post() create(@Body() data: CreateCommunicationCompanyDto) { return this.service.create(data); }
  @Put(':id') update(@Param('id') id: string, @Body() data: UpdateCommunicationCompanyDto) { return this.service.update(Number(id), data); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(Number(id)); }
}
