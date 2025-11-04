import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Accident } from './entities/accident.entity';
import { CreateAccidentDto } from './dto/create-accident.dto';
import { UpdateAccidentDto } from './dto/update-accident.dto';
import { QueryAccidentDto } from './dto/query-accident.dto';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

@Injectable()
export class AccidentsService {
  constructor(
    @InjectRepository(Accident)
    private readonly accidentRepo: Repository<Accident>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
  ) {}

  async create(dto: CreateAccidentDto, companyId?: number): Promise<Accident> {
    // Validar que el vehículo existe
    const vehicle = await this.vehicleRepo.findOne({
      where: { id: dto.vehicleId },
      relations: ['company'],
    });

    if (!vehicle) {
      throw new NotFoundException({
        message: `El vehículo con ID ${dto.vehicleId} no existe`,
        error: 'VEHICLE_NOT_FOUND',
        statusCode: 404,
      });
    }

    // Validar que el vehículo pertenece a la compañía (si se proporciona companyId)
    if (companyId && vehicle.company?.id !== companyId) {
      throw new BadRequestException({
        message: 'El vehículo no pertenece a la compañía especificada',
        error: 'VEHICLE_NOT_IN_COMPANY',
        statusCode: 400,
      });
    }

    const accident = this.accidentRepo.create({
      vehicleId: dto.vehicleId,
      accidentDate: dto.accidentDate,
      detail: dto.detail,
    });

    return this.accidentRepo.save(accident);
  }

  async findAll(query: QueryAccidentDto, companyId?: number): Promise<Accident[]> {
    const where: any = {};

    // Filtrar por vehículo
    if (query.vehicleId) {
      where.vehicleId = query.vehicleId;
    }

    // Filtrar por rango de fechas
    if (query.startDate && query.endDate) {
      where.accidentDate = Between(query.startDate, query.endDate);
    }

    // Filtrar por compañía
    if (companyId) {
      where.vehicle = { company: { id: companyId } };
    }

    return this.accidentRepo.find({
      where,
      relations: ['vehicle', 'vehicle.company', 'vehicle.make', 'vehicle.owner'],
      order: { accidentDate: 'DESC', id: 'DESC' },
    });
  }

  async findOne(id: number, companyId?: number): Promise<Accident> {
    const where: any = { id };

    if (companyId) {
      where.vehicle = { company: { id: companyId } };
    }

    const accident = await this.accidentRepo.findOne({
      where,
      relations: ['vehicle', 'vehicle.company', 'vehicle.make', 'vehicle.owner'],
    });

    if (!accident) {
      throw new NotFoundException({
        message: `El accidente con ID ${id} no existe`,
        error: 'ACCIDENT_NOT_FOUND',
        statusCode: 404,
      });
    }

    return accident;
  }

  async findByVehicle(vehicleId: number, companyId?: number): Promise<Accident[]> {
    const where: any = { vehicleId };

    if (companyId) {
      where.vehicle = { company: { id: companyId } };
    }

    return this.accidentRepo.find({
      where,
      relations: ['vehicle', 'vehicle.company', 'vehicle.make', 'vehicle.owner'],
      order: { accidentDate: 'DESC', id: 'DESC' },
    });
  }

  async update(id: number, dto: UpdateAccidentDto, companyId?: number): Promise<Accident> {
    const accident = await this.findOne(id, companyId);

    // Si se está actualizando el vehículo, validar que existe
    if (dto.vehicleId && dto.vehicleId !== accident.vehicleId) {
      const vehicle = await this.vehicleRepo.findOne({
        where: { id: dto.vehicleId },
        relations: ['company'],
      });

      if (!vehicle) {
        throw new NotFoundException({
          message: `El vehículo con ID ${dto.vehicleId} no existe`,
          error: 'VEHICLE_NOT_FOUND',
          statusCode: 404,
        });
      }

      // Validar que el nuevo vehículo pertenece a la misma compañía
      if (companyId && vehicle.company?.id !== companyId) {
        throw new BadRequestException({
          message: 'El vehículo no pertenece a la compañía especificada',
          error: 'VEHICLE_NOT_IN_COMPANY',
          statusCode: 400,
        });
      }
    }

    // Actualizar campos
    if (dto.vehicleId !== undefined) accident.vehicleId = dto.vehicleId;
    if (dto.accidentDate !== undefined) accident.accidentDate = dto.accidentDate;
    if (dto.detail !== undefined) accident.detail = dto.detail;

    return this.accidentRepo.save(accident);
  }

  async remove(id: number, companyId?: number): Promise<{ message: string; accident: Accident }> {
    const accident = await this.findOne(id, companyId);

    await this.accidentRepo.remove(accident);

    return {
      message: `Accidente con ID ${id} eliminado exitosamente`,
      accident,
    };
  }

}
