import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { OwnerService } from './owner.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { ExportOwnersByIdsDto } from './dto/export-owners.dto';

@Controller('owner')
export class OwnerController {
  constructor(private readonly service: OwnerService) { }

  @Get()
  findAll(@Query('name') name?: string, @Query('identification') identification?: string) {
    let identificationNumber: number | undefined;
    if (identification) {
      identificationNumber = parseInt(identification, 10);
      if (isNaN(identificationNumber)) {
        throw new BadRequestException('Identification must be a valid number.');
      }
    }
    return this.service.findAll(name, identificationNumber);
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

  @Get('export/excel')
  async exportToExcel(@Res() res: Response, @Query('name') name?: string, @Query('identification') identification?: string) {
    let identificationNumber: number | undefined;
    if (identification) {
      identificationNumber = parseInt(identification, 10);
      if (isNaN(identificationNumber)) {
        throw new BadRequestException('Identification must be a valid number.');
      }
    }
    
    const buffer = await this.service.generateExcelReport(name, identificationNumber);
    
    const filename = `propietarios_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    
    res.send(buffer);
  }

  @Post('export/excel/by-ids')
  async exportToExcelByIds(@Body() body: ExportOwnersByIdsDto, @Res() res: Response) {
    const buffer = await this.service.generateExcelReportByIds(body.ownerIds);
    
    const filename = `propietarios_seleccionados_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    
    res.send(buffer);
  }
}
