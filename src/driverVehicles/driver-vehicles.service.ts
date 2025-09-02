import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverVehicle } from './driver-vehicle.entity';
import { CreateDriverVehicleDto } from './dto/create-driver-vehicle.dto';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

@Injectable()
export class DriverVehiclesService {
  constructor(
    @InjectRepository(DriverVehicle) private repo: Repository<DriverVehicle>,
    @InjectRepository(Vehicle) private vehiclesRepo: Repository<Vehicle>,
  ) {}

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
      relations: ['driver', 'driver.eps', 'driver.arl', 'vehicle', 'vehicle.make', 'vehicle.insurer', 'vehicle.communicationCompany', 'vehicle.company'],
    });
  }

  async remove(id: number, companyId?: number) {
    const where: any = { id };
    if (companyId) where.vehicle = { company: { id: companyId } as any } as any;
    const existing = await this.repo.findOne({ where });
    if (!existing) throw new HttpException('Assignment not found', HttpStatus.NOT_FOUND);
    return this.repo.remove(existing);
  }

  async removeBy(driverId: number, vehicleId: number, companyId?: number) {
    const where: any = { driver: { id: driverId } as any, vehicle: { id: vehicleId } as any };
    if (companyId) where.vehicle.company = { id: companyId } as any;
    const existing = await this.repo.findOne({ where });
    if (!existing) throw new HttpException('Assignment not found', HttpStatus.NOT_FOUND);
    return this.repo.remove(existing);
  }
}
