import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Administration } from './entities/administration.entity';
import { CreateAdministrationDto } from './dto/create-administration.dto';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { DateRangeDto } from './dto/date-range.dto';
import { VehicleIdDto } from './dto/vehicle-id.dto';

@Injectable()
export class AdministrationService {
  constructor(
    @InjectRepository(Administration) private readonly adminRepo: Repository<Administration>,
    @InjectRepository(Vehicle) private readonly vehicleRepo: Repository<Vehicle>,
  ) {}

  async create(dto: CreateAdministrationDto): Promise<Administration> {
    const vehicle = await this.vehicleRepo.findOne({ where: { id: dto.vehicleId } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    const entity = new Administration();
    entity.date = dto.date;
    // asegurar entero
    entity.value = Number.isInteger(dto.value) ? dto.value : Math.trunc(Number(dto.value));
    entity.detail = dto.detail.trim();
    entity.payer = dto.payer.trim();
    entity.vehicle = vehicle;
    return this.adminRepo.save(entity);
  }

  async findAll(): Promise<Administration[]> {
    return this.adminRepo.find({ relations: { vehicle: true } });
  }

  async findByDateRange(dto: DateRangeDto): Promise<Administration[]> {
    const { startDate, endDate } = dto;
    return this.adminRepo.find({
      where: { date: Between(startDate, endDate) },
      relations: { vehicle: true },
      order: { date: 'ASC', id: 'ASC' },
    });
  }

  async findByVehicleId(dto: VehicleIdDto): Promise<Administration[]> {
    const { vehicleId } = dto;
    return this.adminRepo.find({
      where: { vehicle: { id: vehicleId } },
      relations: { vehicle: true },
      order: { date: 'ASC', id: 'ASC' },
    });
  }
}
