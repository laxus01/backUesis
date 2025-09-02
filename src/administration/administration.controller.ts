import { BadRequestException, Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AdministrationService } from './administration.service';
import { CreateAdministrationDto } from './dto/create-administration.dto';
import { DateRangeDto } from './dto/date-range.dto';
import { VehicleIdDto } from './dto/vehicle-id.dto';

@Controller('administrations')
export class AdministrationController {
  constructor(private readonly service: AdministrationService) {}

  @Post()
  async create(@Body() dto: CreateAdministrationDto) {
    return this.service.create(dto);
  }

  @Post('bulk')
  async createMany(@Body() body: any) {
    let data: any = body;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch { /* ignore */ }
    }
    if (data && !Array.isArray(data) && Array.isArray((data as any).items)) {
      data = (data as any).items;
    }
    if (!Array.isArray(data)) {
      throw new BadRequestException('Body must be a JSON array of CreateAdministrationDto');
    }
    return this.service.createMany(data as CreateAdministrationDto[]);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Post('date-range')
  async findByDateRange(@Body() dto: DateRangeDto) {
    return this.service.findByDateRange(dto);
  }

  @Post('vehicle')
  async findByVehicle(@Body() dto: VehicleIdDto) {
    return this.service.findByVehicleId(dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.service.remove(id);
  }

}
