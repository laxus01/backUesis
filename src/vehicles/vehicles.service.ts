import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
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
}
