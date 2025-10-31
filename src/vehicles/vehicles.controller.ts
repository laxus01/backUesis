import { Body, Controller, Delete, Get, Headers, Param, ParseIntPipe, Patch, Post, Put, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { CreateManyVehiclesPipe } from './pipes/create-many-vehicles.pipe';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';
import { ExportVehiclesByIdsDto } from './dto/export-vehicles.dto';
import { ToggleStateVehicleDto } from './dto/update-vehicle.dto';


@Controller('vehicles')
export class VehiclesController {
  constructor(
    private readonly vehiclesService: VehiclesService,
  ) { }

  @Get()
  async findAll(@Query() query: QueryVehicleDto, @Headers('companyId') companyId: string) {
    return this.vehiclesService.findAll(query, companyId ? parseInt(companyId) : undefined);
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

  @Get('export/excel')
  async exportToExcel(@Query() query: QueryVehicleDto, @Headers('companyId') companyId: string, @Res() res: Response) {
    const buffer = await this.vehiclesService.generateExcelReport(query, companyId);

    const filename = `vehiculos_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Post('export/excel/by-ids')
  async exportToExcelByIds(@Body() body: ExportVehiclesByIdsDto, @Res() res: Response) {
    const buffer = await this.vehiclesService.generateExcelReportByIds(body.vehicleIds);

    const filename = `vehiculos_seleccionados_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Patch(':id/toggle-state')
  async toggleState(
    @Param('id', ParseIntPipe) id: number,
    @Body() toggleStateDto: ToggleStateVehicleDto
  ) {
    return this.vehiclesService.toggleState(id, toggleStateDto.reason);
  }

  @Get(':id/state-history')
  async getStateHistory(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.getStateHistory(id);
  }
}
