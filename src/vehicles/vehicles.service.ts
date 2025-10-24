import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleStateHistory } from './entities/vehicle-state-history.entity';
import { DriverVehicle } from '../driverVehicles/entities/driver-vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle) private vehiclesRepository: Repository<Vehicle>,
    @InjectRepository(VehicleStateHistory) private vehicleStateHistoryRepository: Repository<VehicleStateHistory>,
    @InjectRepository(DriverVehicle) private driverVehicleRepository: Repository<DriverVehicle>,
  ) {}

  async findAll({ plate }: QueryVehicleDto, companyId?: number) {
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
      order: { createdAt: 'DESC' }
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
      const saved = await this.vehiclesRepository.save(entity) as unknown as Vehicle;
      return saved;
    } catch (error) {
      this._handleError(error);
    }
  }

  async createMany(items: CreateVehicleDto[]) {
    const created: Vehicle[] = [];
    const failed: Array<{ input: CreateVehicleDto; reason: string }> = [];
    for (const data of items) {
      try {
        const entityData = this._dtoToEntity(data);
        const entity = this.vehiclesRepository.create(entityData);
        const saved = await this.vehiclesRepository.save(entity);
        created.push(saved as unknown as Vehicle);
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

  async remove(id: number) {
    // Verificar si el vehículo existe
    const existing = await this.vehiclesRepository.findOne({ 
      where: { id },
      relations: ['make', 'company']
    });
    
    if (!existing) {
      throw new HttpException({
        message: 'Vehículo no encontrado',
        error: 'VEHICLE_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
        vehicleId: id
      }, HttpStatus.NOT_FOUND);
    }

    // Verificar si el vehículo tiene conductores asignados
    const assignedDrivers = await this.driverVehicleRepository.find({
      where: { vehicle: { id } },
      relations: ['driver']
    });

    if (assignedDrivers.length > 0) {
      const driversInfo = assignedDrivers.map(dv => ({
        id: dv.driver.id,
        firstName: dv.driver.firstName,
        lastName: dv.driver.lastName,
        identification: dv.driver.identification
      }));

      throw new HttpException({
        message: `No se puede eliminar el vehículo porque tiene ${assignedDrivers.length} conductor(es) asignado(s)`,
        error: 'VEHICLE_HAS_ASSIGNED_DRIVERS',
        statusCode: HttpStatus.CONFLICT,
        vehicleId: id,
        vehiclePlate: existing.plate,
        assignedDriversCount: assignedDrivers.length,
        assignedDrivers: driversInfo
      }, HttpStatus.CONFLICT);
    }

    // Si no hay conductores asignados, proceder con la eliminación
    await this.vehiclesRepository.remove(existing);
    
    return {
      message: 'Vehículo eliminado exitosamente',
      success: true,
      deletedVehicle: {
        id: id,
        plate: existing.plate,
        model: existing.model,
        make: existing.make?.name,
        company: existing.company?.name
      }
    };
  }

  async toggleState(vehicleId: number, reason: string) {
    // Buscar el vehículo
    const vehicle = await this.vehiclesRepository.findOne({ 
      where: { id: vehicleId },
      relations: ['make', 'insurer', 'communicationCompany', 'owner', 'company']
    });

    if (!vehicle) {
      throw new HttpException({
        message: 'Vehículo no encontrado',
        error: 'VEHICLE_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
        vehicleId
      }, HttpStatus.NOT_FOUND);
    }

    // Cambiar el estado: si es 0 pasa a 1, si es 1 pasa a 0
    const newState = vehicle.state === 0 ? 1 : 0;
    const previousState = vehicle.state;

    // Guardar en el historial antes de actualizar
    const historyEntry = this.vehicleStateHistoryRepository.create({
      vehicleId,
      vehicle,
      previousState,
      newState,
      reason
    });
    await this.vehicleStateHistoryRepository.save(historyEntry);

    // Actualizar el estado
    await this.vehiclesRepository.update(vehicleId, { state: newState });

    // Obtener el vehículo actualizado
    const updatedVehicle = await this.vehiclesRepository.findOne({
      where: { id: vehicleId },
      relations: ['make', 'insurer', 'communicationCompany', 'owner', 'company']
    });

    return {
      message: `Estado del vehículo cambiado exitosamente de ${previousState} a ${newState}`,
      vehicle: updatedVehicle,
      previousState,
      newState,
      reason,
      changedAt: new Date().toISOString(),
      historyId: historyEntry.id
    };
  }

  async getStateHistory(vehicleId: number) {
    // Verificar que el vehículo existe
    const vehicle = await this.vehiclesRepository.findOne({ where: { id: vehicleId } });
    
    if (!vehicle) {
      throw new HttpException({
        message: 'Vehículo no encontrado',
        error: 'VEHICLE_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
        vehicleId
      }, HttpStatus.NOT_FOUND);
    }

    // Obtener el historial ordenado por fecha de creación descendente
    const history = await this.vehicleStateHistoryRepository.find({
      where: { vehicleId },
      relations: ['vehicle'],
      order: { createdAt: 'DESC' }
    });

    return {
      vehicleId,
      vehiclePlate: vehicle.plate,
      currentState: vehicle.state,
      totalChanges: history.length,
      history
    };
  }

  async generateExcelReport(queryParams: QueryVehicleDto = {}, companyId?: string): Promise<Buffer> {
    // Obtener los vehículos con las mismas condiciones que findAll
    const vehicles = await this.getVehiclesForExport(queryParams, companyId ? parseInt(companyId) : undefined);

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

  private async getVehiclesForExport(queryParams: QueryVehicleDto, companyId?: number) {
    const where: any = {};
    
    if (queryParams.plate) {
      where.plate = Like(`%${queryParams.plate}%`);
    }
    
    if (companyId) {
      where.company = { id: companyId };
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

  /**
   * Transforma un DTO en un objeto compatible con la entidad Vehicle
   * Convierte los IDs de relaciones en objetos con formato { id: number }
   */
  private _dtoToEntity(dto: CreateVehicleDto | UpdateVehicleDto): any {
    const entity: any = { ...dto };

    // Transformar las relaciones de IDs a objetos
    if (dto.makeId !== undefined) {
      entity.make = { id: dto.makeId };
      delete entity.makeId;
    }

    if (dto.insurerId !== undefined) {
      entity.insurer = dto.insurerId > 0 ? { id: dto.insurerId } : null;
      delete entity.insurerId;
    }

    if (dto.communicationCompanyId !== undefined) {
      entity.communicationCompany = dto.communicationCompanyId > 0 ? { id: dto.communicationCompanyId } : null;
      delete entity.communicationCompanyId;
    }

    if (dto.ownerId !== undefined) {
      entity.owner = dto.ownerId > 0 ? { id: dto.ownerId } : null;
      delete entity.ownerId;
    }

    if (dto.companyId !== undefined) {
      entity.company = { id: dto.companyId };
      delete entity.companyId;
    }

    return entity;
  }

  /**
   * Maneja errores comunes de base de datos
   */
  private _handleError(error: any): never {
    if (error?.code === 'ER_DUP_ENTRY') {
      throw new HttpException(
        'El vehículo ya existe (placa duplicada)',
        HttpStatus.CONFLICT
      );
    }
    throw new HttpException(
      error.message || 'Error al procesar la solicitud',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}