import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  async findAll(@Query('plate') plate?: string, @Query('companyId') companyId?: string) {
    return this.vehiclesService.findAll(plate, companyId ? Number(companyId) : undefined);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(Number(id));
  }

  @Post()
  async create(@Body() data: CreateVehicleDto) {
    return this.vehiclesService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateVehicleDto) {
    return this.vehiclesService.update(Number(id), data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.vehiclesService.remove(Number(id));
  }
}
