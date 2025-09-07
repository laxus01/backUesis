import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query } from '@nestjs/common';
import { DriverVehiclesService } from './driver-vehicles.service';
import { CreateDriverVehicleDto } from './dto/create-driver-vehicle.dto';
import { UpdateDriverVehicleDto } from './dto/update-driver-vehicle.dto';

@Controller('driver-vehicles')
export class DriverVehiclesController {
  constructor(private readonly service: DriverVehiclesService) { }

  @Get()
  findAll(@Headers('companyId') companyId: string) {
    return this.service.findAll(companyId ? Number(companyId) : undefined);
  }

  @Post()
  create(@Headers('companyId') companyId: string, @Body() data: CreateDriverVehicleDto) {
    return this.service.create(data, companyId ? Number(companyId) : undefined);
  }

  @Get('by-driver/:driverId')
  findByDriver(@Headers('companyId') companyId: string, @Param('driverId') driverId: string) {
    return this.service.findByDriver(Number(driverId), companyId ? Number(companyId) : undefined);
  }

  @Get('by-vehicle/:vehicleId')
  findByVehicle(@Headers('companyId') companyId: string, @Param('vehicleId') vehicleId: string) {
    return this.service.findByVehicle(Number(vehicleId), companyId ? Number(companyId) : undefined);
  }

  @Get('by-id/:id')
  findById(@Headers('companyId') companyId: string, @Param('id') id: string) {
    return this.service.findById(Number(id), companyId ? Number(companyId) : undefined);
  }


  @Get('expiring')
  findByExpirationDate(
    @Headers('companyId') companyId: string,
    @Query('expirationDate') expirationDate: string,
    @Query('fieldName') fieldName: string
  ) {
    return this.service.findByExpirationDate(expirationDate, fieldName, companyId ? Number(companyId) : undefined);
  }

  @Put(':id')
  update(@Headers('companyId') companyId: string, @Param('id') id: string, @Body() data: UpdateDriverVehicleDto, @Headers('changedBy') changedBy?: string) {
    return this.service.update(Number(id), data, companyId ? Number(companyId) : undefined, changedBy);
  }

  @Delete(':id')
  remove(@Headers('companyId') companyId: string, @Param('id') id: string) {
    return this.service.remove(Number(id), companyId ? Number(companyId) : undefined);
  }

  @Delete('by')
  removeBy(@Headers('companyId') companyId: string, @Query('driverId') driverId: string, @Query('vehicleId') vehicleId: string) {
    return this.service.removeBy(Number(driverId), Number(vehicleId), companyId ? Number(companyId) : undefined);
  }
}
