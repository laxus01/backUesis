import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
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
