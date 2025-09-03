import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';

@Controller('owner')
export class OwnerController {
  constructor(private readonly service: OwnerService) { }

  @Get()
  findAll(@Query('name') name?: string, @Query('identification') identification?: string) {
    return this.service.findAll(name, identification);
  }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(Number(id)); }
  @Post() create(@Body() data: CreateOwnerDto) { return this.service.create(data); }
  @Post('bulk')
  createMany(@Body() body: any) {
    let data: any = body;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch { /* ignore */ }
    }
    if (data && !Array.isArray(data) && Array.isArray((data as any).items)) {
      data = (data as any).items;
    }
    if (!Array.isArray(data)) {
      throw new BadRequestException('Body must be a JSON array of CreateOwnerDto');
    }
    return this.service.createMany(data as CreateOwnerDto[]);
  }
  @Put(':id') update(@Param('id') id: string, @Body() data: UpdateOwnerDto) { return this.service.update(Number(id), data); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(Number(id)); }
}
