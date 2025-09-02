import { Body, Controller, Delete, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { DriverVehiclesService } from './driver-vehicles.service';
import { CreateDriverVehicleDto } from './dto/create-driver-vehicle.dto';

@Controller('driver-vehicles')
export class DriverVehiclesController {
  constructor(private readonly service: DriverVehiclesService) {}

  @Get()
  findAll(@Headers('x-company-id') companyId: string) {
    return this.service.findAll(companyId ? Number(companyId) : undefined);
  }

  @Post()
  create(@Headers('x-company-id') companyId: string, @Body() data: CreateDriverVehicleDto) {
    return this.service.create(data, companyId ? Number(companyId) : undefined);
  }

  @Get('by-driver/:driverId')
  findByDriver(@Headers('x-company-id') companyId: string, @Param('driverId') driverId: string) {
    return this.service.findByDriver(Number(driverId), companyId ? Number(companyId) : undefined);
  }

  @Get('by-vehicle/:vehicleId')
  findByVehicle(@Headers('x-company-id') companyId: string, @Param('vehicleId') vehicleId: string) {
    return this.service.findByVehicle(Number(vehicleId), companyId ? Number(companyId) : undefined);
  }

  @Get('by-id/:id')
  findById(@Headers('x-company-id') companyId: string, @Param('id') id: string) {
    return this.service.findById(Number(id), companyId ? Number(companyId) : undefined);
  }

  @Delete(':id')
  remove(@Headers('x-company-id') companyId: string, @Param('id') id: string) {
    return this.service.remove(Number(id), companyId ? Number(companyId) : undefined);
  }

  @Delete()
  removeBy(@Headers('x-company-id') companyId: string, @Query('driverId') driverId: string, @Query('vehicleId') vehicleId: string) {
    return this.service.removeBy(Number(driverId), Number(vehicleId), companyId ? Number(companyId) : undefined);
  }
}
