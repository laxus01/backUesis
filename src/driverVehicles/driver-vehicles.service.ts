import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverVehicle } from './entities/driver-vehicle.entity';
import { CreateDriverVehicleDto } from './dto/create-driver-vehicle.dto';
import { UpdateDriverVehicleDto } from './dto/update-driver-vehicle.dto';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { DriverVehiclesHistoryService } from '../driverVehiclesHistory/driver-vehicles-history.service';

@Injectable()
export class DriverVehiclesService {
  constructor(
    @InjectRepository(DriverVehicle) private repo: Repository<DriverVehicle>,
    @InjectRepository(Vehicle) private vehiclesRepo: Repository<Vehicle>,
    private historyService: DriverVehiclesHistoryService,
  ) { }

  async create(data: CreateDriverVehicleDto, companyId?: number) {
    // If scoping by company, ensure vehicle belongs to the company
    if (companyId) {
      const vehicle = await this.vehiclesRepo.findOne({ where: { id: data.vehicleId, company: { id: companyId } as any } });
      if (!vehicle) {
        throw new HttpException('Vehicle does not belong to company', HttpStatus.FORBIDDEN);
      }
    }
    // Upsert by (driverId, vehicleId)
    const existing = await this.repo.findOne({
      where: {
        driver: { id: data.driverId } as any,
        vehicle: { id: data.vehicleId } as any,
      },
    });

    const payload: Partial<DriverVehicle> = {
      driver: { id: data.driverId } as any,
      vehicle: { id: data.vehicleId } as any,
      permitExpiresOn: data.permitExpiresOn,
      note: data.note,
      soat: data.soat,
      soatExpires: data.soatExpires,
      operationCard: data.operationCard,
      operationCardExpires: data.operationCardExpires,
      contractualExpires: data.contractualExpires,
      extraContractualExpires: data.extraContractualExpires,
      technicalMechanicExpires: data.technicalMechanicExpires,
    };

    const entity = existing ? this.repo.merge(existing, payload) : this.repo.create(payload);
    try {
      const saved = await this.repo.save(entity);
      
      // Guardar automáticamente en el historial después de crear/actualizar
      const actionType = existing ? 'UPDATE' : 'CREATE';
      await this.historyService.saveToHistory(saved, actionType);
      
      return saved;
    } catch (e: any) {
      throw new HttpException('Error saving assignment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(companyId?: number) {
    const where: any = {};
    if (companyId) where.vehicle = { company: { id: companyId } as any } as any;
    return this.repo.find({ where, relations: ['driver', 'vehicle', 'vehicle.company'] });
  }

  async findByDriver(driverId: number, companyId?: number) {
    const where: any = { driver: { id: driverId } as any };
    if (companyId) where.vehicle = { company: { id: companyId } as any } as any;
    return this.repo.find({ where, relations: ['driver', 'vehicle', 'vehicle.company'] });
  }

  async findByVehicle(vehicleId: number, companyId?: number) {
    const where: any = { vehicle: { id: vehicleId } as any };
    if (companyId) where.vehicle.company = { id: companyId } as any;
    return this.repo.find({ where, relations: ['driver', 'vehicle', 'vehicle.company'] });
  }

  async findById(id: number, companyId?: number) {
    const where: any = { id };
    if (companyId) where.vehicle = { company: { id: companyId } as any } as any;
    return this.repo.findOne({
      where,
      relations: ['driver', 'driver.eps', 'driver.arl', 'vehicle', 'vehicle.make', 'vehicle.insurer', 'vehicle.communicationCompany', 'vehicle.company', 'vehicle.owner'],
    });
  }

  async remove(id: number, companyId?: number, changedBy?: string) {
    const where: any = { id };
    if (companyId) where.vehicle = { company: { id: companyId } as any } as any;
    const existing = await this.repo.findOne({ 
      where,
      relations: ['driver', 'vehicle', 'vehicle.company']
    });
    if (!existing) throw new HttpException('Assignment not found', HttpStatus.NOT_FOUND);
    
    // Guardar en el historial antes de eliminar
    await this.historyService.saveToHistory(existing, 'DELETE', changedBy);
    
    return this.repo.remove(existing);
  }

  async removeBy(driverId: number, vehicleId: number, companyId?: number, changedBy?: string) {
    const where: any = { driver: { id: driverId } as any, vehicle: { id: vehicleId } as any };
    if (companyId) where.vehicle.company = { id: companyId } as any;
    const existing = await this.repo.findOne({ 
      where,
      relations: ['driver', 'vehicle', 'vehicle.company']
    });
    if (!existing) throw new HttpException('Assignment not found', HttpStatus.NOT_FOUND);
    
    // Guardar en el historial antes de eliminar
    await this.historyService.saveToHistory(existing, 'DELETE', changedBy);
    
    return this.repo.remove(existing);
  }


  async update(id: number, data: UpdateDriverVehicleDto, companyId?: number, changedBy?: string) {
    // Verificar si existe la asignación conductor-vehículo
    const where: any = { id };
    if (companyId) where.vehicle = { company: { id: companyId } as any } as any;
    
    const existing = await this.repo.findOne({ 
      where,
      relations: ['driver', 'vehicle', 'vehicle.company']
    });
    
    if (!existing) {
      throw new HttpException({
        message: 'Asignación conductor-vehículo no encontrada',
        error: 'DRIVER_VEHICLE_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
        assignmentId: id
      }, HttpStatus.NOT_FOUND);
    }

    // Guardar el registro actual en el historial antes de actualizar
    await this.historyService.saveToHistory(existing, 'UPDATE', changedBy);

    // Actualizar solo los campos proporcionados
    const updatedEntity = this.repo.merge(existing, {
      permitExpiresOn: data.permitExpiresOn,
      note: data.note,
      soat: data.soat,
      soatExpires: data.soatExpires,
      operationCard: data.operationCard,
      operationCardExpires: data.operationCardExpires,
      contractualExpires: data.contractualExpires,
      extraContractualExpires: data.extraContractualExpires,
      technicalMechanicExpires: data.technicalMechanicExpires,
    });

    try {
      const saved = await this.repo.save(updatedEntity);
      return {
        message: 'Asignación conductor-vehículo actualizada exitosamente',
        success: true,
        updatedAssignment: saved
      };
    } catch (error) {
      throw new HttpException({
        message: 'Error al actualizar la asignación conductor-vehículo',
        error: 'UPDATE_ERROR',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        assignmentId: id
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findByExpirationDate(expirationDate: string, fieldName: string, companyId?: number) {
    // Validar que el campo sea uno de los permitidos
    const allowedFields = [
      'permit_expires_on',
      'soat_expires_on', 
      'operation_card_expires_on',
      'contractual_expires_on',
      'extra_contractual_expires_on',
      'technical_mechanic_expires_on',
      'expires_on' // Campo de la tabla drivers
    ];

    if (!allowedFields.includes(fieldName)) {
      throw new HttpException({
        message: 'Campo de fecha no válido',
        error: 'INVALID_FIELD_NAME',
        statusCode: HttpStatus.BAD_REQUEST,
        allowedFields
      }, HttpStatus.BAD_REQUEST);
    }

    // Obtener fecha actual en formato YYYY-MM-DD
    const currentDate = new Date().toISOString().split('T')[0];

    const queryBuilder = this.repo.createQueryBuilder('driverVehicle')
      .leftJoinAndSelect('driverVehicle.driver', 'driver')
      .leftJoinAndSelect('driverVehicle.vehicle', 'vehicle')
      .leftJoinAndSelect('vehicle.company', 'company')
      .leftJoinAndSelect('vehicle.make', 'make')
      .leftJoinAndSelect('driver.eps', 'eps')
      .leftJoinAndSelect('driver.arl', 'arl');

    // Filtrar por empresa si se proporciona
    if (companyId) {
      queryBuilder.andWhere('company.id = :companyId', { companyId });
    }

    // Aplicar filtro según el campo especificado
    // Filtrar: fecha_campo >= fecha_actual AND fecha_campo <= fecha_recibida
    if (fieldName === 'expires_on') {
      // Campo de la tabla drivers
      queryBuilder.andWhere('driver.expiresOn >= :currentDate', { currentDate });
      queryBuilder.andWhere('driver.expiresOn <= :expirationDate', { expirationDate });
    } else {
      // Campos de la tabla drivers_vehicles - mapeo correcto
      let columnName: string;
      switch (fieldName) {
        case 'permit_expires_on':
          columnName = 'permitExpiresOn';
          break;
        case 'soat_expires_on':
          columnName = 'soatExpires';
          break;
        case 'operation_card_expires_on':
          columnName = 'operationCardExpires';
          break;
        case 'contractual_expires_on':
          columnName = 'contractualExpires';
          break;
        case 'extra_contractual_expires_on':
          columnName = 'extraContractualExpires';
          break;
        case 'technical_mechanic_expires_on':
          columnName = 'technicalMechanicExpires';
          break;
        default:
          columnName = fieldName;
      }
      queryBuilder.andWhere(`driverVehicle.${columnName} >= :currentDate`, { currentDate });
      queryBuilder.andWhere(`driverVehicle.${columnName} <= :expirationDate`, { expirationDate });
    }

    return queryBuilder
      .orderBy('driverVehicle.id', 'ASC')
      .getMany();
  }

}
