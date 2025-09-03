import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Administration } from './entities/administration.entity';
import { CreateAdministrationDto } from './dto/create-administration.dto';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { DateRangeDto } from './dto/date-range.dto';
import { VehicleIdDto } from './dto/vehicle-id.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AdministrationService {
  constructor(
    @InjectRepository(Administration) private readonly adminRepo: Repository<Administration>,
    @InjectRepository(Vehicle) private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) { }

  async create(dto: CreateAdministrationDto): Promise<Administration> {
    const vehicle = await this.vehicleRepo.findOne({ where: { id: dto.vehicleId } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    const entity = new Administration();
    // fecha: usar la provista o la actual en formato YYYY-MM-DD
    entity.date = dto.date ?? new Date().toISOString().slice(0, 10);
    // asegurar entero
    entity.value = Number.isInteger(dto.value) ? dto.value : Math.trunc(Number(dto.value));
    entity.detail = dto.detail.trim();
    entity.payer = dto.payer.trim();
    entity.vehicle = vehicle;
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');
    entity.user = user;
    return this.adminRepo.save(entity);
  }

  async createMany(items: CreateAdministrationDto[]) {
    const created: Administration[] = [];
    const failed: Array<{ input: CreateAdministrationDto; reason: string }> = [];
    // cache simple de vehículos por id para reducir consultas repetidas
    const vehicleCache = new Map<number, Vehicle | null>();
    const userCache = new Map<number, User | null>();
    for (const dto of items) {
      try {
        let vehicle = vehicleCache.get(dto.vehicleId) ?? null;
        if (vehicle === null && !vehicleCache.has(dto.vehicleId)) {
          vehicle = await this.vehicleRepo.findOne({ where: { id: dto.vehicleId } });
          vehicleCache.set(dto.vehicleId, vehicle ?? null);
        }
        if (!vehicle) {
          failed.push({ input: dto, reason: 'Vehicle not found' });
          continue;
        }
        let user = userCache.get(dto.userId) ?? null;
        if (user === null && !userCache.has(dto.userId)) {
          user = await this.userRepo.findOne({ where: { id: dto.userId } });
          userCache.set(dto.userId, user ?? null);
        }
        if (!user) {
          failed.push({ input: dto, reason: 'User not found' });
          continue;
        }
        const entity = new Administration();
        entity.date = dto.date ?? new Date().toISOString().slice(0, 10);
        entity.value = Number.isInteger(dto.value) ? dto.value : Math.trunc(Number(dto.value));
        entity.detail = dto.detail.trim();
        entity.payer = dto.payer.trim();
        entity.vehicle = vehicle;
        entity.user = user;
        const saved = await this.adminRepo.save(entity);
        created.push(saved);
      } catch (e: any) {
        failed.push({ input: dto, reason: 'Error creating administration' });
      }
    }
    return { created, failed };
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
      relations: { vehicle: true, user: true },
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
    await this.adminRepo.delete(id);
  }
}
