import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { CreateManyDriversPipe } from './pipes/create-many-drivers.pipe';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { ToggleStateDriverDto, UpdateDriverDto } from './dto/update-driver.dto';
import { ExportDriversByIdsDto } from './dto/export-drivers.dto';

@Controller('drivers')
export class DriversController {
  constructor(private readonly service: DriversService) { }

  @Get()
  find(@Query('identification') identification?: string) {
    if (identification) {
      return this.service.searchByIdentification(identification.trim());
    }
    return this.service.findAll();
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
  @Post() create(@Body() data: CreateDriverDto) { return this.service.create(data); }
  @Post('bulk')
  createMany(@Body(CreateManyDriversPipe) data: CreateDriverDto[]) {
    return this.service.createMany(data);
  }
  @Put(':id') update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateDriverDto) { return this.service.update(id, data); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }

  @Get('export/excel')
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.service.generateExcelReport();

    const filename = `conductores_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Post('export/excel/by-ids')
  async exportToExcelByIds(@Body() body: ExportDriversByIdsDto, @Res() res: Response) {
    const buffer = await this.service.generateExcelReportByIds(body.driverIds);

    const filename = `conductores_seleccionados_${new Date().toISOString().split('T')[0]}.xlsx`;

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
    @Body() toggleStateDto: ToggleStateDriverDto
  ) {
    return this.service.toggleState(id, toggleStateDto.reason);
  }
}
