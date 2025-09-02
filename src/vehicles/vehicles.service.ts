import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle) private vehiclesRepository: Repository<Vehicle>,
  ) {}

  async findAll(plate?: string, companyId?: number) {
    const where = plate
      ? { plate: Like(`%${plate}%`) }
      : {};
    const companyWhere = companyId ? { company: { id: companyId } as any } : {};
    return this.vehiclesRepository.find({
      where: { ...where, ...companyWhere },
      relations: ['make', 'insurer', 'communicationCompany', 'owner', 'company'],
    });
  }

  async findOne(id: number) {
    return this.vehiclesRepository.findOne({
      where: { id },
      relations: ['make', 'insurer', 'communicationCompany', 'owner', 'company'],
    });
  }

  async create(data: CreateVehicleDto) {
    try {
      const entity = this.vehiclesRepository.create({
        plate: data.plate,
        model: data.model,
        internalNumber: data.internalNumber,
        mobileNumber: data.mobileNumber,
        make: { id: data.makeId } as any,
        insurer: data.insurerId ? ({ id: data.insurerId } as any) : undefined,
        communicationCompany: data.communicationCompanyId ? ({ id: data.communicationCompanyId } as any) : undefined,
        owner: data.ownerId ? ({ id: data.ownerId } as any) : undefined,
        company: { id: data.companyId } as any,
      });
      return await this.vehiclesRepository.save(entity);
    } catch (error: any) {
      if (error?.code === 'ER_DUP_ENTRY') {
        throw new HttpException('Vehicle already exists (duplicate plate)', HttpStatus.CONFLICT);
      }
      throw new HttpException('Error creating vehicle', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, data: UpdateVehicleDto) {
    const existing = await this.vehiclesRepository.findOne({ where: { id } });
    if (!existing) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }
    // Actualizar campos escalares si vienen en el DTO
    if (data.plate !== undefined) existing.plate = data.plate;
    if (data.model !== undefined) existing.model = data.model;
    if (data.internalNumber !== undefined) existing.internalNumber = data.internalNumber;
    if (data.mobileNumber !== undefined) existing.mobileNumber = data.mobileNumber;

    // Actualizar relaciones si los IDs vienen en el DTO
    if (data.makeId !== undefined) existing.make = { id: data.makeId } as any;
    if (data.insurerId !== undefined) existing.insurer = data.insurerId ? ({ id: data.insurerId } as any) : null as any;
    if (data.communicationCompanyId !== undefined) existing.communicationCompany = data.communicationCompanyId ? ({ id: data.communicationCompanyId } as any) : null as any;
    if (data.ownerId !== undefined) existing.owner = data.ownerId ? ({ id: data.ownerId } as any) : null as any;
    if (data.companyId !== undefined) existing.company = data.companyId ? ({ id: data.companyId } as any) : null as any;

    const merged = existing;
    try {
      return await this.vehiclesRepository.save(merged);
    } catch (error: any) {
      if (error?.code === 'ER_DUP_ENTRY') {
        throw new HttpException('Vehicle already exists (duplicate plate)', HttpStatus.CONFLICT);
      }
      throw new HttpException('Error updating vehicle', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    const existing = await this.vehiclesRepository.findOne({ where: { id } });
    if (!existing) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }
    return this.vehiclesRepository.remove(existing);
  }
}
