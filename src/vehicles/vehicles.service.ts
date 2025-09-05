import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle) private vehiclesRepository: Repository<Vehicle>,
  ) {}

  async findAll({ plate, companyId }: QueryVehicleDto) {
    const where: any = {};
    if (plate) {
      where.plate = Like(`%${plate}%`);
    }
    if (companyId) {
      where.company = { id: companyId };
    }
    return this.vehiclesRepository.find({
      where,
      relations: ['make', 'insurer', 'communicationCompany', 'owner', 'company'],
    });
  }

  async findOne(id: number) {
    return this.vehiclesRepository.findOne({
      where: { id },
      relations: ['make', 'insurer', 'communicationCompany', 'owner', 'company'],
    });
  }

  async findByOwnerId(ownerId: number) {
    return this.vehiclesRepository.findOne({
      where: { owner: { id: ownerId } as any },
      relations: ['make', 'insurer', 'communicationCompany', 'owner', 'company'],
    });
  }

  async create(data: CreateVehicleDto) {
    try {
      const entity = this.vehiclesRepository.create(this._dtoToEntity(data));
      return await this.vehiclesRepository.save(entity);
    } catch (error) {
      this._handleError(error);
    }
  }

  async createMany(items: CreateVehicleDto[]) {
    const created: Vehicle[] = [];
    const failed: Array<{ input: CreateVehicleDto; reason: string }> = [];
    for (const data of items) {
      try {
        const entity = this.vehiclesRepository.create(this._dtoToEntity(data));
        const saved = await this.vehiclesRepository.save(entity);
        created.push(saved);
      } catch (error: any) {
        const reason = error?.code === 'ER_DUP_ENTRY'
          ? 'Vehicle already exists (duplicate plate)'
          : error.message || 'Error creating vehicle';
        failed.push({ input: data, reason });
      }
    }
    return { created, failed };
  }

  async update(id: number, data: UpdateVehicleDto) {
    const updateData = this._dtoToEntity(data);
    const vehicleToUpdate = await this.vehiclesRepository.preload({
      id,
      ...updateData,
    });

    if (!vehicleToUpdate) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }

    try {
      return await this.vehiclesRepository.save(vehicleToUpdate);
    } catch (error) {
      this._handleError(error);
    }
  }

  private _dtoToEntity(data: Partial<CreateVehicleDto | UpdateVehicleDto>) {
    const entity: Partial<Vehicle> = {};
    if (data.plate !== undefined) entity.plate = data.plate;
    if (data.model !== undefined) entity.model = data.model;
    if (data.internalNumber !== undefined) entity.internalNumber = data.internalNumber;
    if (data.mobileNumber !== undefined) entity.mobileNumber = data.mobileNumber;
    if (data.engineNumber !== undefined) entity.engineNumber = data.engineNumber;
    if (data.chassisNumber !== undefined) entity.chassisNumber = data.chassisNumber;
    if (data.line !== undefined) entity.line = data.line;
    if (data.entryDate !== undefined) entity.entryDate = data.entryDate;
    if (data.makeId !== undefined) entity.make = { id: data.makeId } as any;
    if (data.insurerId !== undefined) entity.insurer = data.insurerId > 0 ? { id: data.insurerId } as any : null;
    if (data.communicationCompanyId !== undefined) entity.communicationCompany = data.communicationCompanyId > 0 ? { id: data.communicationCompanyId } as any : null;
    if (data.ownerId !== undefined) entity.owner = data.ownerId > 0 ? { id: data.ownerId } as any : null;
    if (data.companyId !== undefined) entity.company = { id: data.companyId } as any;
    return entity;
  }

  private _handleError(error: any) {
    if (error?.code === 'ER_DUP_ENTRY') {
      throw new HttpException('Vehicle already exists (duplicate plate)', HttpStatus.CONFLICT);
    }
    throw new HttpException(error.message || 'Error processing request', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  async remove(id: number) {
    const existing = await this.vehiclesRepository.findOne({ where: { id } });
    if (!existing) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }
    return this.vehiclesRepository.remove(existing);
  }

  async generateExcelReport(queryParams: QueryVehicleDto = {}): Promise<Buffer> {
    // Obtener los vehículos con las mismas condiciones que findAll
    const vehicles = await this.getVehiclesForExport(queryParams);

    // Crear un nuevo libro de trabajo
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Vehículos');

    // Configurar las columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Placa', key: 'plate', width: 15 },
      { header: 'Modelo', key: 'model', width: 20 },
      { header: 'Marca', key: 'make', width: 20 },
      { header: 'Número Interno', key: 'internalNumber', width: 15 },
      { header: 'Aseguradora', key: 'insurer', width: 25 },
      { header: 'Empresa de Comunicación', key: 'communicationCompany', width: 30 },
      { header: 'Número Móvil', key: 'mobileNumber', width: 15 },
      { header: 'Propietario', key: 'owner', width: 30 },
      { header: 'Empresa', key: 'company', width: 25 },
      { header: 'Número de Motor', key: 'engineNumber', width: 20 },
      { header: 'Número de Chasis', key: 'chassisNumber', width: 20 },
      { header: 'Línea', key: 'line', width: 15 },
      { header: 'Fecha de Ingreso', key: 'entryDate', width: 15 },
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
    vehicles.forEach((vehicle, index) => {
      const row = worksheet.addRow({
        id: vehicle.id,
        plate: vehicle.plate,
        model: vehicle.model,
        make: vehicle.make?.name || 'N/A',
        internalNumber: vehicle.internalNumber || 'N/A',
        insurer: vehicle.insurer?.name || 'N/A',
        communicationCompany: vehicle.communicationCompany?.name || 'N/A',
        mobileNumber: vehicle.mobileNumber || 'N/A',
        owner: vehicle.owner?.name || 'N/A',
        company: vehicle.company?.name || 'N/A',
        engineNumber: vehicle.engineNumber || 'N/A',
        chassisNumber: vehicle.chassisNumber || 'N/A',
        line: vehicle.line || 'N/A',
        entryDate: vehicle.entryDate || 'N/A',
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
    worksheet.getCell(`A${lastRow}`).value = `Total de vehículos: ${vehicles.length}`;
    worksheet.getCell(`A${lastRow}`).font = { bold: true };
    
    const dateRow = lastRow + 1;
    worksheet.getCell(`A${dateRow}`).value = `Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`;
    worksheet.getCell(`A${dateRow}`).font = { italic: true };

    // Generar el buffer del archivo Excel
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async generateExcelReportByIds(vehicleIds: number[]): Promise<Buffer> {
    // Obtener vehículos específicos por IDs
    const vehicles = await this.vehiclesRepository.find({
      where: vehicleIds.map(id => ({ id })),
      relations: ['make', 'insurer', 'communicationCompany', 'owner', 'company'],
      order: { id: 'ASC' },
    });

    return this.generateExcelFromVehicles(vehicles);
  }

  private async getVehiclesForExport(queryParams: QueryVehicleDto) {
    const where: any = {};
    
    if (queryParams.plate) {
      where.plate = Like(`%${queryParams.plate}%`);
    }
    
    if (queryParams.companyId) {
      where.company = { id: queryParams.companyId };
    }

    return this.vehiclesRepository.find({
      where,
      relations: ['make', 'insurer', 'communicationCompany', 'owner', 'company'],
      order: { id: 'ASC' },
    });
  }

  private async generateExcelFromVehicles(vehicles: Vehicle[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Vehículos');

    // Configurar las columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Placa', key: 'plate', width: 15 },
      { header: 'Modelo', key: 'model', width: 20 },
      { header: 'Marca', key: 'make', width: 20 },
      { header: 'Número Interno', key: 'internalNumber', width: 15 },
      { header: 'Aseguradora', key: 'insurer', width: 25 },
      { header: 'Empresa de Comunicación', key: 'communicationCompany', width: 30 },
      { header: 'Número Móvil', key: 'mobileNumber', width: 15 },
      { header: 'Propietario', key: 'owner', width: 30 },
      { header: 'Empresa', key: 'company', width: 25 },
      { header: 'Número de Motor', key: 'engineNumber', width: 20 },
      { header: 'Número de Chasis', key: 'chassisNumber', width: 20 },
      { header: 'Línea', key: 'line', width: 15 },
      { header: 'Fecha de Ingreso', key: 'entryDate', width: 15 },
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
    vehicles.forEach((vehicle, index) => {
      const row = worksheet.addRow({
        id: vehicle.id,
        plate: vehicle.plate,
        model: vehicle.model,
        make: vehicle.make?.name || 'N/A',
        internalNumber: vehicle.internalNumber || 'N/A',
        insurer: vehicle.insurer?.name || 'N/A',
        communicationCompany: vehicle.communicationCompany?.name || 'N/A',
        mobileNumber: vehicle.mobileNumber || 'N/A',
        owner: vehicle.owner?.name || 'N/A',
        company: vehicle.company?.name || 'N/A',
        engineNumber: vehicle.engineNumber || 'N/A',
        chassisNumber: vehicle.chassisNumber || 'N/A',
        line: vehicle.line || 'N/A',
        entryDate: vehicle.entryDate || 'N/A',
      });

      // Alternar colores de fila
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F8F9FA' },
        };
      }
    });

    // Agregar bordes
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

    // Información adicional
    const lastRow = worksheet.lastRow.number + 2;
    worksheet.getCell(`A${lastRow}`).value = `Total de vehículos: ${vehicles.length}`;
    worksheet.getCell(`A${lastRow}`).font = { bold: true };
    
    const dateRow = lastRow + 1;
    worksheet.getCell(`A${dateRow}`).value = `Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`;
    worksheet.getCell(`A${dateRow}`).font = { italic: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
