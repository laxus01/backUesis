import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { CreateManyVehiclesPipe } from './pipes/create-many-vehicles.pipe';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) { }

  @Get()
  async findAll(
    @Query('plate') plate?: string,
    @Query('companyId', new ParseIntPipe({ optional: true })) companyId?: number,
  ) {
    return this.vehiclesService.findAll(plate, companyId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.findOne(id);
  }

  @Post()
  async create(@Body() data: CreateVehicleDto) {
    return this.vehiclesService.create(data);
  }

  @Post('bulk')
  async createMany(@Body(CreateManyVehiclesPipe) data: CreateVehicleDto[]) {
    return this.vehiclesService.createMany(data);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateVehicleDto) {
    return this.vehiclesService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.remove(id);
  }
}
