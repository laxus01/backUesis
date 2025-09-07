import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Raw, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Owner } from './entities/owner.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';

@Injectable()
export class OwnerService {
  constructor(
    @InjectRepository(Owner) private repo: Repository<Owner>,
    @InjectRepository(Vehicle) private vehicleRepo: Repository<Vehicle>,
  ) { }

  findAll(name?: string, identification?: number) {
    const where: any = {};
    if (name) {
      where.name = Like(`%${name}%`);
    }
    if (typeof identification === 'number' && !isNaN(identification)) {
      where.identification = Like(`${identification}%`);
    }
    return this.repo.find({ 
      where,
      order: { createdAt: 'DESC' }
    });
  }
  findOne(id: number) { return this.repo.findOne({ where: { id } }); }

  async create(data: CreateOwnerDto) {
    // Verificar si la identificación ya existe
    const existingOwner = await this.repo.findOne({ 
      where: { identification: data.identification } 
    });
    
    if (existingOwner) {
      throw new HttpException({
        message: 'La identificación ya existe en la base de datos',
        error: 'IDENTIFICATION_ALREADY_EXISTS',
        statusCode: HttpStatus.CONFLICT,
        identification: data.identification
      }, HttpStatus.CONFLICT);
    }

    try { 
      return await this.repo.save(this.repo.create(data)); 
    } catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY') {
        throw new HttpException({
          message: 'La identificación ya existe en la base de datos',
          error: 'IDENTIFICATION_ALREADY_EXISTS',
          statusCode: HttpStatus.CONFLICT,
          identification: data.identification
        }, HttpStatus.CONFLICT);
      }
      throw new HttpException({
        message: 'Error interno al crear el propietario',
        error: 'INTERNAL_SERVER_ERROR',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createMany(dtos: CreateOwnerDto[]) {
    const created: Owner[] = [];
    const failed: Array<{ input: CreateOwnerDto; reason: string; error?: string; identification?: number }> = [];
    
    for (const data of dtos) {
      try {
        // Verificar si la identificación ya existe
        const existingOwner = await this.repo.findOne({ 
          where: { identification: data.identification } 
        });
        
        if (existingOwner) {
          failed.push({ 
            input: data, 
            reason: 'La identificación ya existe en la base de datos',
            error: 'IDENTIFICATION_ALREADY_EXISTS',
            identification: data.identification
          });
          continue;
        }

        const saved = await this.repo.save(this.repo.create(data));
        created.push(saved);
      } catch (e: any) {
        if (e?.code === 'ER_DUP_ENTRY') {
          failed.push({ 
            input: data, 
            reason: 'La identificación ya existe en la base de datos',
            error: 'IDENTIFICATION_ALREADY_EXISTS',
            identification: data.identification
          });
        } else {
          failed.push({ 
            input: data, 
            reason: 'Error interno al crear el propietario',
            error: 'INTERNAL_SERVER_ERROR'
          });
        }
      }
    }
    return { created, failed };
  }

  async update(id: number, data: UpdateOwnerDto) {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new HttpException({
        message: 'Propietario no encontrado',
        error: 'OWNER_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND
      }, HttpStatus.NOT_FOUND);
    }

    // Si se está actualizando la identificación, verificar que no exista en otro propietario
    if (data.identification && Number(data.identification) !== existing.identification) {
      const ownerWithSameIdentification = await this.repo.findOne({ 
        where: { identification: Number(data.identification) } 
      });
      
      if (ownerWithSameIdentification && ownerWithSameIdentification.id !== existing.id) {
        throw new HttpException({
          message: 'La identificación ya existe en la base de datos',
          error: 'IDENTIFICATION_ALREADY_EXISTS',
          statusCode: HttpStatus.CONFLICT,
          identification: Number(data.identification)
        }, HttpStatus.CONFLICT);
      }
    }

    Object.assign(existing, data);
    try {
      return await this.repo.save(existing);
    } catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY') {
        throw new HttpException({
          message: 'La identificación ya existe en la base de datos',
          error: 'IDENTIFICATION_ALREADY_EXISTS',
          statusCode: HttpStatus.CONFLICT,
          identification: data.identification
        }, HttpStatus.CONFLICT);
      }
      throw new HttpException({
        message: 'Error interno al actualizar el propietario',
        error: 'INTERNAL_SERVER_ERROR',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new HttpException({
        message: 'Propietario no encontrado',
        error: 'OWNER_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND
      }, HttpStatus.NOT_FOUND);
    }

    // Verificar si el propietario tiene vehículos vinculados
    const vehiclesCount = await this.vehicleRepo.count({
      where: { owner: { id: existing.id } }
    });

    if (vehiclesCount > 0) {
      throw new HttpException({
        message: 'No se puede eliminar el propietario porque tiene vehículos relacionados',
        error: 'OWNER_HAS_RELATED_VEHICLES',
        statusCode: HttpStatus.CONFLICT,
        vehiclesCount: vehiclesCount
      }, HttpStatus.CONFLICT);
    }

    return this.repo.remove(existing);
  }

  async generateExcelReport(name?: string, identification?: number): Promise<Buffer> {
    // Obtener los propietarios con los mismos filtros que findAll
    const owners = await this.getOwnersForExport(name, identification);

    // Crear un nuevo libro de trabajo
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Propietarios');

    // Configurar las columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'name', width: 30 },
      { header: 'Identificación', key: 'identification', width: 15 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Dirección', key: 'address', width: 40 },
      { header: 'Teléfono', key: 'phone', width: 15 },
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
    owners.forEach((owner, index) => {
      const row = worksheet.addRow({
        id: owner.id,
        name: owner.name,
        identification: owner.identification,
        email: owner.email || 'N/A',
        address: owner.address || 'N/A',
        phone: owner.phone,
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
    worksheet.getCell(`A${lastRow}`).value = `Total de propietarios: ${owners.length}`;
    worksheet.getCell(`A${lastRow}`).font = { bold: true };
    
    const dateRow = lastRow + 1;
    worksheet.getCell(`A${dateRow}`).value = `Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`;
    worksheet.getCell(`A${dateRow}`).font = { italic: true };

    // Generar el buffer del archivo Excel
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async generateExcelReportByIds(ownerIds: number[]): Promise<Buffer> {
    // Obtener propietarios específicos por IDs
    const owners = await this.repo.find({
      where: ownerIds.map(id => ({ id })),
      order: { id: 'ASC' },
    });

    return this.generateExcelFromOwners(owners);
  }

  private async getOwnersForExport(name?: string, identification?: number) {
    const where: any = {};
    if (name) {
      where.name = Like(`%${name}%`);
    }
    if (typeof identification === 'number' && !isNaN(identification)) {
      where.identification = Like(`${identification}%`);
    }
    return this.repo.find({ 
      where,
      order: { id: 'ASC' },
    });
  }

  private async generateExcelFromOwners(owners: Owner[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Propietarios');

    // Configurar las columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'name', width: 30 },
      { header: 'Identificación', key: 'identification', width: 15 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Dirección', key: 'address', width: 40 },
      { header: 'Teléfono', key: 'phone', width: 15 },
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
    owners.forEach((owner, index) => {
      const row = worksheet.addRow({
        id: owner.id,
        name: owner.name,
        identification: owner.identification,
        email: owner.email || 'N/A',
        address: owner.address || 'N/A',
        phone: owner.phone,
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
    worksheet.getCell(`A${lastRow}`).value = `Total de propietarios: ${owners.length}`;
    worksheet.getCell(`A${lastRow}`).font = { bold: true };
    
    const dateRow = lastRow + 1;
    worksheet.getCell(`A${dateRow}`).value = `Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`;
    worksheet.getCell(`A${dateRow}`).font = { italic: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
