import { Body, Controller, Get, Post } from '@nestjs/common';
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
}
