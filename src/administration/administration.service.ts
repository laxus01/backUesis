import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Administration } from './entities/administration.entity';
import { CreateAdministrationDto } from './dto/create-administration.dto';
import { VehiclesService } from '../vehicles/vehicles.service';
import { DateRangeDto } from './dto/date-range.dto';
import { VehicleIdDto } from './dto/vehicle-id.dto';
import { OwnerIdDto } from './dto/owner-id.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdministrationService {
  constructor(
    @InjectRepository(Administration) private readonly adminRepo: Repository<Administration>,
    private readonly vehiclesService: VehiclesService,
    private readonly usersService: UsersService,
  ) { }

  async create(dto: CreateAdministrationDto): Promise<Administration> {
    const entity = await this._dtoToEntity(dto);
    return this.adminRepo.save(entity);
  }

  async createMany(items: CreateAdministrationDto[]) {
    const results = await Promise.allSettled(items.map(dto => this.create(dto)));

    const created = results
      .filter(r => r.status === 'fulfilled')
      .map((r: PromiseFulfilledResult<Administration>) => r.value);

    const failed = results
      .filter(r => r.status === 'rejected')
      .map((r: PromiseRejectedResult, i) => ({ input: items[i], reason: r.reason.message }));

    return { created, failed };
  }

  async findAll(): Promise<Administration[]> {
    return this.adminRepo.find({ relations: { vehicle: true } });
  }

  async findByDateRange(dto: DateRangeDto, companyId?: number): Promise<Administration[]> {
    const { startDate, endDate } = dto;
    const where: any = { date: Between(startDate, endDate) };
    
    if (companyId) {
      where.vehicle = { company: { id: companyId } };
    }
    
    return this.adminRepo.find({
      where,
      relations: { vehicle: { company: true } },
      order: { date: 'ASC', id: 'ASC' },
    });
  }

  async findByVehicleId(dto: VehicleIdDto): Promise<Administration[]> {
    const { vehicleId } = dto;
    return this.adminRepo.find({
      where: { vehicle: { id: vehicleId } },
      relations: { vehicle: true, user: true },
      order: { date: 'DESC', id: 'DESC' },
    });
  }

  async findByOwnerId(dto: OwnerIdDto): Promise<Administration[]> {
    const { ownerId } = dto;
    return this.adminRepo.find({
      where: { vehicle: { owner: { id: ownerId } } },
      relations: { vehicle: { owner: true }, user: true },
      order: { date: 'DESC', id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Administration> {
    const admin = await this.adminRepo.findOne({
      where: { id },
      relations: { vehicle: true, user: true },
    });
    if (!admin) {
      throw new NotFoundException('Administration not found');
    }
    return admin;
  }

  async remove(id: number): Promise<void> {
    const admin = await this.findOne(id);
    await this.adminRepo.remove(admin);
  }

  async generateExcelReportByDateRange(dto: DateRangeDto, companyId?: string): Promise<Buffer> {
  // Obtener las administraciones con las mismas condiciones que findByDateRange
  const administrations = await this.findByDateRange(dto, companyId ? parseInt(companyId) : undefined);
  
  const additionalInfo = [
    `Rango de fechas: ${dto.startDate} - ${dto.endDate}`
  ];
  
  return this.generateExcelFromAdministrations(administrations, additionalInfo);
}

  async generateExcelReportByOwner(dto: OwnerIdDto): Promise<Buffer> {
  // Obtener las administraciones por propietario
  const administrations = await this.findByOwnerId(dto);
  
  const additionalInfo = [
    `Propietario ID: ${dto.ownerId}`,
    `Propietario: ${administrations[0]?.vehicle?.owner?.name || 'N/A'}`
  ];
  
  return this.generateExcelFromAdministrations(administrations, additionalInfo);
}

async generateExcelReportByVehicle(dto: VehicleIdDto): Promise<Buffer> {
  // Obtener las administraciones por vehículo
  const administrations = await this.findByVehicleId(dto);
  
  const additionalInfo = [
    `Vehículo ID: ${dto.vehicleId}`,
    `Vehículo (Placa): ${administrations[0]?.vehicle?.plate || 'N/A'}`
  ];
  
  return this.generateExcelFromAdministrations(administrations, additionalInfo);
}

private async generateExcelFromAdministrations(administrations: Administration[], additionalInfo: string[] = []): Promise<Buffer> {
  // Crear un nuevo libro de trabajo
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Administraciones');

  // Configurar las columnas
  worksheet.columns = [
    { header: 'Fecha', key: 'date', width: 15 },
    { header: 'Valor', key: 'value', width: 15 },
    { header: 'Detalle', key: 'detail', width: 40 },
    { header: 'Pagador', key: 'payer', width: 25 },
    { header: 'Vehículo (Placa)', key: 'vehiclePlate', width: 20 },
    { header: 'Usuario', key: 'user', width: 25 },
    { header: 'Fecha de Creación', key: 'createdAt', width: 20 },
  ];

  // Estilizar el encabezado
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '366092' },
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

  // Agregar los datos
  administrations.forEach((admin, index) => {
    const row = worksheet.addRow({
      date: admin.date,
      value: admin.value,
      detail: admin.detail || 'N/A',
      payer: admin.payer || 'N/A',
      vehiclePlate: admin.vehicle?.plate || 'N/A',
      user: admin.user?.name || 'N/A',
      createdAt: admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('es-ES') : 'N/A',
    });

    // Alternar colores de fila para mejor legibilidad
    if (index % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F8F9FA' },
      };
    }
  });

  // Agregar bordes a todas las celdas
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  // Agregar información adicional al final
  const lastRow = worksheet.lastRow.number + 2;
  worksheet.getCell(`A${lastRow}`).value = `Total de administraciones: ${administrations.length}`;
  worksheet.getCell(`A${lastRow}`).font = { bold: true };
  
  const dateRow = lastRow + 1;
  worksheet.getCell(`A${dateRow}`).value = `Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`;
  worksheet.getCell(`A${dateRow}`).font = { italic: true };

  // Agregar información adicional específica
  additionalInfo.forEach((info, index) => {
    const infoRow = lastRow + 2 + index;
    worksheet.getCell(`A${infoRow}`).value = info;
    worksheet.getCell(`A${infoRow}`).font = { italic: true };
  });

  // Calcular el total de valores
  const totalValue = administrations.reduce((sum, admin) => sum + admin.value, 0);
  const totalRow = lastRow + 2 + additionalInfo.length + 1;
  worksheet.getCell(`A${totalRow}`).value = `Valor total: ${totalValue.toLocaleString('es-ES')}`;
  worksheet.getCell(`A${totalRow}`).font = { bold: true, color: { argb: '366092' } };

  // Generar el buffer del archivo Excel
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

  private async _dtoToEntity(dto: CreateAdministrationDto): Promise<Administration> {
    const vehicle = await this.vehiclesService.findOne(dto.vehicleId);
    const user = await this.usersService.getUserById(dto.userId);

    const entity = new Administration();
    entity.date = dto.date ?? new Date().toISOString().slice(0, 10);
    entity.value = Number.isInteger(dto.value) ? dto.value : Math.trunc(Number(dto.value));
    entity.detail = dto.detail.trim();
    entity.payer = dto.payer.trim();
    entity.vehicle = vehicle;
    entity.user = user as any; // El servicio ya sanitiza, pero aquí necesitamos la entidad completa

    return entity;
  }
}
