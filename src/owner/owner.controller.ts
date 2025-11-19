import { BadRequestException, Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { OwnerService } from './owner.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { ExportOwnersByIdsDto } from './dto/export-owners.dto';

@Controller('owner')
export class OwnerController {
  constructor(private readonly service: OwnerService) { }

  @Get()
  async findAll(
    @Query('name') name?: string, 
    @Query('identification') identification?: string,
    @Headers('companyId') companyId?: string
  ) {
    let identificationNumber: number | undefined;
    if (identification) {
      identificationNumber = parseInt(identification, 10);
      if (isNaN(identificationNumber)) {
        throw new BadRequestException('Identification must be a valid number.');
      }
    }
    
    let companyIdNumber: number | undefined;
    if (companyId) {
      companyIdNumber = parseInt(companyId, 10);
      if (isNaN(companyIdNumber)) {
        throw new BadRequestException('CompanyId must be a valid number.');
      }
    }

    const owners = await this.service.findAll(name, identificationNumber, companyIdNumber);
    const vehicles = await this.service.findVehiclesByOwnerFilters(name, identificationNumber, companyIdNumber);

    const ownersWithCompanyVehicles = owners.map(owner => {
      const ownerVehicles = vehicles.filter(v => v.owner?.id === owner.id);

      return {
        ...owner,
        company: owner.company,
        vehicles: ownerVehicles,
      };
    });

    return ownersWithCompanyVehicles;
  }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(Number(id)); }
  @Post() 
  create(@Body() data: CreateOwnerDto, @Headers('companyId') companyId?: string) { 
    if (companyId) {
      const companyIdNumber = parseInt(companyId, 10);
      if (isNaN(companyIdNumber)) {
        throw new BadRequestException('CompanyId must be a valid number.');
      }
      data.companyId = companyIdNumber;
    }
    
    if (!data.companyId) {
      throw new BadRequestException('CompanyId is required.');
    }
    
    return this.service.create(data); 
  }
  @Post('bulk')
  createMany(@Body() body: any, @Headers('companyId') companyId?: string) {
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
    
    // Asignar companyId a todos los elementos si viene en el header
    if (companyId) {
      const companyIdNumber = parseInt(companyId, 10);
      if (isNaN(companyIdNumber)) {
        throw new BadRequestException('CompanyId must be a valid number.');
      }
      data = data.map((item: CreateOwnerDto) => ({ ...item, companyId: companyIdNumber }));
    }
    
    // Validar que todos los elementos tengan companyId
    const itemsWithoutCompanyId = data.filter((item: CreateOwnerDto) => !item.companyId);
    if (itemsWithoutCompanyId.length > 0) {
      throw new BadRequestException('CompanyId is required for all items.');
    }
    
    return this.service.createMany(data as CreateOwnerDto[]);
  }
  @Put(':id') 
  update(@Param('id') id: string, @Body() data: UpdateOwnerDto, @Headers('companyId') companyId?: string) { 
    if (companyId) {
      const companyIdNumber = parseInt(companyId, 10);
      if (isNaN(companyIdNumber)) {
        throw new BadRequestException('CompanyId must be a valid number.');
      }
      data.companyId = companyIdNumber;
    }
    return this.service.update(Number(id), data); 
  }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(Number(id)); }

  @Get('export/excel')
  async exportToExcel(
    @Res() res: Response, 
    @Query('name') name?: string, 
    @Query('identification') identification?: string,
    @Headers('companyId') companyId?: string
  ) {
    let identificationNumber: number | undefined;
    if (identification) {
      identificationNumber = parseInt(identification, 10);
      if (isNaN(identificationNumber)) {
        throw new BadRequestException('Identification must be a valid number.');
      }
    }
    
    let companyIdNumber: number | undefined;
    if (companyId) {
      companyIdNumber = parseInt(companyId, 10);
      if (isNaN(companyIdNumber)) {
        throw new BadRequestException('CompanyId must be a valid number.');
      }
    }
    
    const buffer = await this.service.generateExcelReport(name, identificationNumber, companyIdNumber);
    
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
