import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Raw, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Driver } from './entities/driver.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriverVehicle } from '../driverVehicles/entities/driver-vehicle.entity';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver) private repo: Repository<Driver>,
    @InjectRepository(DriverVehicle) private driverVehicleRepo: Repository<DriverVehicle>,
  ) { }

  async findAll() {
    const drivers = await this.repo.find({ relations: ['eps', 'arl'] });
    return drivers.map(driver => this._transformDriver(driver));
  }
  async findOne(id: number) {
    const driver = await this.repo.findOne({ where: { id }, relations: ['eps', 'arl'] });
    if (!driver) {
      throw new HttpException('Driver not found', HttpStatus.NOT_FOUND);
    }
    return this._transformDriver(driver);
  }

  async searchByIdentification(q: string) {
    const sanitizedQ = q.replace(/\D/g, '');

    if (!sanitizedQ) {
      return [];
    }

    const drivers = await this.repo.find({
      where: { identification: Raw(alias => `${alias} LIKE :q`, { q: `${sanitizedQ}%` }) },
      take: 20,
      relations: ['eps', 'arl'],
    });

    return drivers.map(driver => this._transformDriver(driver));
  }

  async create(data: CreateDriverDto) {
    try {
      const entity = this.repo.create(this._dtoToEntity(data));
      const savedDriver = await this.repo.save(entity);
      return this._transformDriver(savedDriver);
    } catch (error) {
      this._handleError(error);
    }
  }

  async createMany(data: CreateDriverDto[]) {
    const created: any[] = [];
    const errors: { input: CreateDriverDto; reason: string }[] = [];

    for (const dto of data) {
      try {
        const entity = this.repo.create(this._dtoToEntity(dto));
        const savedDriver = await this.repo.save(entity);
        created.push(this._transformDriver(savedDriver));
      } catch (error) {
        const reason = error.code === 'ER_DUP_ENTRY' ? 'Driver already exists (duplicate identification)' : 'Error creating driver';
        errors.push({ input: dto, reason });
      }
    }

    return { created, failed: errors };
  }

  async update(id: number, data: UpdateDriverDto) {
    const driverToUpdate = await this.repo.preload({
      id,
      ...this._dtoToEntity(data),
    });

    if (!driverToUpdate) {
      throw new HttpException('Driver not found', HttpStatus.NOT_FOUND);
    }

    try {
      const savedDriver = await this.repo.save(driverToUpdate);
      return this._transformDriver(savedDriver);
    } catch (error) {
      this._handleError(error);
    }
  }

  async remove(id: number) {
    // 1. Verificar si existe un registro en la tabla drivers con el id enviado por parámetro
    const driver = await this.repo.findOne({ where: { id } });
    if (!driver) {
      throw new HttpException({
        message: 'Conductor no encontrado',
        error: 'DRIVER_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
        driverId: id
      }, HttpStatus.NOT_FOUND);
    }

    // 2. Verificar si existe un registro en la tabla drivers_vehicles con driver_id igual al valor de la URL
    const existingDriverVehicle = await this.driverVehicleRepo.findOne({
      where: { driver: { id } }
    });

    // 3. Si existen registros con driver_id, retornar error
    if (existingDriverVehicle) {
      throw new HttpException({
        message: 'No se puede eliminar el conductor porque tiene vehículos asignados',
        error: 'DRIVER_HAS_ASSIGNED_VEHICLES',
        statusCode: HttpStatus.CONFLICT,
        driverId: id,
        driverName: `${driver.firstName} ${driver.lastName}`,
        driverIdentification: driver.identification
      }, HttpStatus.CONFLICT);
    }

    // 4. Si no hay dependencias, proceder a eliminar el registro
    await this.repo.remove(driver);
    
    return {
      message: 'Conductor eliminado exitosamente',
      success: true,
      deletedDriver: {
        id: driver.id,
        name: `${driver.firstName} ${driver.lastName}`,
        identification: driver.identification
      }
    };
  }

  private _dtoToEntity(data: CreateDriverDto | UpdateDriverDto): Partial<Driver> {
    const { epsId, arlId, ...rest } = data;
    const entity: Partial<Driver> = { ...rest };

    if (epsId !== undefined) {
      entity.eps = epsId ? { id: epsId } as any : null;
    }

    if (arlId !== undefined) {
      entity.arl = arlId ? { id: arlId } as any : null;
    }

    return entity;
  }

  private _transformDriver(driver: Driver) {
    if (!driver) return null;
    const { eps, arl, ...rest } = driver;
    return {
      ...rest,
      epsId: eps?.id ?? null,
      arlId: arl?.id ?? null,
    };
  }

  async generateExcelReport(): Promise<Buffer> {
    // Obtener todos los conductores con sus relaciones
    const drivers = await this.getDriversForExport();

    // Crear un nuevo libro de trabajo
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Conductores');

    // Configurar las columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Identificación', key: 'identification', width: 15 },
      { header: 'Expedida en', key: 'issuedIn', width: 20 },
      { header: 'Nombres', key: 'firstName', width: 20 },
      { header: 'Apellidos', key: 'lastName', width: 20 },
      { header: 'Teléfono', key: 'phone', width: 15 },
      { header: 'Dirección', key: 'address', width: 30 },
      { header: 'Licencia', key: 'license', width: 15 },
      { header: 'Categoría', key: 'category', width: 12 },
      { header: 'Vence', key: 'expiresOn', width: 15 },
      { header: 'Tipo de Sangre', key: 'bloodType', width: 15 },
      { header: 'EPS', key: 'eps', width: 25 },
      { header: 'ARL', key: 'arl', width: 25 },
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
    drivers.forEach((driver, index) => {
      const row = worksheet.addRow({
        id: driver.id,
        identification: driver.identification,
        issuedIn: driver.issuedIn,
        firstName: driver.firstName,
        lastName: driver.lastName,
        phone: driver.phone,
        address: driver.address,
        license: driver.license,
        category: driver.category,
        expiresOn: driver.expiresOn,
        bloodType: driver.bloodType,
        eps: driver.eps?.name || 'N/A',
        arl: driver.arl?.name || 'N/A',
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
    worksheet.getCell(`A${lastRow}`).value = `Total de conductores: ${drivers.length}`;
    worksheet.getCell(`A${lastRow}`).font = { bold: true };
    
    const dateRow = lastRow + 1;
    worksheet.getCell(`A${dateRow}`).value = `Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`;
    worksheet.getCell(`A${dateRow}`).font = { italic: true };

    // Generar el buffer del archivo Excel
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async generateExcelReportByIds(driverIds: number[]): Promise<Buffer> {
    // Obtener conductores específicos por IDs
    const drivers = await this.repo.find({
      where: driverIds.map(id => ({ id })),
      relations: ['eps', 'arl'],
      order: { id: 'ASC' },
    });

    return this.generateExcelFromDrivers(drivers);
  }

  private async getDriversForExport() {
    return this.repo.find({
      relations: ['eps', 'arl'],
      order: { id: 'ASC' },
    });
  }

  private async generateExcelFromDrivers(drivers: Driver[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Conductores');

    // Configurar las columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Identificación', key: 'identification', width: 15 },
      { header: 'Expedida en', key: 'issuedIn', width: 20 },
      { header: 'Nombres', key: 'firstName', width: 20 },
      { header: 'Apellidos', key: 'lastName', width: 20 },
      { header: 'Teléfono', key: 'phone', width: 15 },
      { header: 'Dirección', key: 'address', width: 30 },
      { header: 'Licencia', key: 'license', width: 15 },
      { header: 'Categoría', key: 'category', width: 12 },
      { header: 'Vence', key: 'expiresOn', width: 15 },
      { header: 'Tipo de Sangre', key: 'bloodType', width: 15 },
      { header: 'EPS', key: 'eps', width: 25 },
      { header: 'ARL', key: 'arl', width: 25 },
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
    drivers.forEach((driver, index) => {
      const row = worksheet.addRow({
        id: driver.id,
        identification: driver.identification,
        issuedIn: driver.issuedIn,
        firstName: driver.firstName,
        lastName: driver.lastName,
        phone: driver.phone,
        address: driver.address,
        license: driver.license,
        category: driver.category,
        expiresOn: driver.expiresOn,
        bloodType: driver.bloodType,
        eps: driver.eps?.name || 'N/A',
        arl: driver.arl?.name || 'N/A',
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
    worksheet.getCell(`A${lastRow}`).value = `Total de conductores: ${drivers.length}`;
    worksheet.getCell(`A${lastRow}`).font = { bold: true };
    
    const dateRow = lastRow + 1;
    worksheet.getCell(`A${dateRow}`).value = `Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`;
    worksheet.getCell(`A${dateRow}`).font = { italic: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private _handleError(error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new HttpException('Driver already exists (duplicate identification)', HttpStatus.CONFLICT);
    }
    throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
