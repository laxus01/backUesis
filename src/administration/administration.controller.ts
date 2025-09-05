import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CreateManyAdministrationPipe } from './pipes/create-many-administration.pipe';
import { AdministrationService } from './administration.service';
import { CreateAdministrationDto } from './dto/create-administration.dto';
import { DateRangeDto } from './dto/date-range.dto';
import { VehicleIdDto } from './dto/vehicle-id.dto';
import { OwnerIdDto } from './dto/owner-id.dto';

@Controller('administrations')
export class AdministrationController {
  constructor(private readonly service: AdministrationService) { }

  @Post()
  async create(@Body() dto: CreateAdministrationDto) {
    return this.service.create(dto);
  }

  @Post('bulk')
  async createMany(@Body(CreateManyAdministrationPipe) data: CreateAdministrationDto[]) {
    return this.service.createMany(data);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post('date-range')
  async findByDateRange(@Body() dto: DateRangeDto) {
    return this.service.findByDateRange(dto);
  }

  @Post('vehicle')
  async findByVehicle(@Body() dto: VehicleIdDto) {
    return this.service.findByVehicleId(dto);
  }

  @Post('owner')
  async findByOwner(@Body() dto: OwnerIdDto) {
    return this.service.findByOwnerId(dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

}
