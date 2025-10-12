import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverVehicleHistory } from './entities/driver-vehicle-history.entity';
import { QueryDriverVehicleHistoryDto } from './dto/query-driver-vehicle-history.dto';
import { DriverVehicle } from '../driverVehicles/entities/driver-vehicle.entity';

@Injectable()
export class DriverVehiclesHistoryService {
  constructor(
    @InjectRepository(DriverVehicleHistory) private historyRepo: Repository<DriverVehicleHistory>,
  ) { }

  async saveToHistory(original: DriverVehicle, actionType: string, changedBy?: string) {
    const historyRecord = this.historyRepo.create({
      driver: original.driver,
      vehicle: original.vehicle,
      originalRecordId: original.id,
      permitExpiresOn: original.permitExpiresOn,
      note: original.note,
      soat: original.soat,
      soatExpires: original.soatExpires,
      operationCard: original.operationCard,
      operationCardExpires: original.operationCardExpires,
      contractualExpires: original.contractualExpires,
      extraContractualExpires: original.extraContractualExpires,
      technicalMechanicExpires: original.technicalMechanicExpires,
      originalCreatedAt: original.createdAt,
      originalUpdatedAt: original.updatedAt,
      actionType,
      changedBy
    });

    await this.historyRepo.save(historyRecord);
  }

  async findHistory(query: QueryDriverVehicleHistoryDto, companyId?: number) {
    const queryBuilder = this.historyRepo.createQueryBuilder('history')
      .leftJoinAndSelect('history.driver', 'driver')
      .leftJoinAndSelect('history.vehicle', 'vehicle')
      .leftJoinAndSelect('vehicle.company', 'company');

    if (companyId) {
      queryBuilder.andWhere('company.id = :companyId', { companyId });
    }

    if (query.driverId) {
      queryBuilder.andWhere('driver.id = :driverId', { driverId: query.driverId });
    }

    if (query.vehicleId) {
      queryBuilder.andWhere('vehicle.id = :vehicleId', { vehicleId: query.vehicleId });
    }

    if (query.originalRecordId) {
      queryBuilder.andWhere('history.originalRecordId = :originalRecordId', { originalRecordId: query.originalRecordId });
    }

    if (query.actionType) {
      queryBuilder.andWhere('history.actionType = :actionType', { actionType: query.actionType });
    }

    if (query.changedBy) {
      queryBuilder.andWhere('history.changedBy LIKE :changedBy', { changedBy: `%${query.changedBy}%` });
    }

    if (query.fromDate) {
      queryBuilder.andWhere('history.historyCreatedAt >= :fromDate', { fromDate: query.fromDate });
    }

    if (query.toDate) {
      queryBuilder.andWhere('history.historyCreatedAt <= :toDate', { toDate: query.toDate });
    }

    // Subconsulta para obtener el MAX(id) por cada originalRecordId
    const subQuery = this.historyRepo.createQueryBuilder('sub')
      .select('MAX(sub.id)', 'maxId')
      .groupBy('sub.originalRecordId');

    // Aplicar los mismos filtros en la subconsulta si existen
    if (companyId) {
      subQuery
        .leftJoin('sub.vehicle', 'subVehicle')
        .leftJoin('subVehicle.company', 'subCompany')
        .andWhere('subCompany.id = :companyId', { companyId });
    }

    if (query.driverId) {
      subQuery
        .leftJoin('sub.driver', 'subDriver')
        .andWhere('subDriver.id = :driverId', { driverId: query.driverId });
    }

    if (query.vehicleId) {
      if (!companyId) {
        subQuery.leftJoin('sub.vehicle', 'subVehicle');
      }
      subQuery.andWhere('subVehicle.id = :vehicleId', { vehicleId: query.vehicleId });
    }

    if (query.originalRecordId) {
      subQuery.andWhere('sub.originalRecordId = :originalRecordId', { originalRecordId: query.originalRecordId });
    }

    if (query.actionType) {
      subQuery.andWhere('sub.actionType = :actionType', { actionType: query.actionType });
    }

    if (query.changedBy) {
      subQuery.andWhere('sub.changedBy LIKE :changedBy', { changedBy: `%${query.changedBy}%` });
    }

    if (query.fromDate) {
      subQuery.andWhere('sub.historyCreatedAt >= :fromDate', { fromDate: query.fromDate });
    }

    if (query.toDate) {
      subQuery.andWhere('sub.historyCreatedAt <= :toDate', { toDate: query.toDate });
    }

    // Filtrar la consulta principal usando la subconsulta
    return queryBuilder
      .andWhere(`history.id IN (${subQuery.getQuery()})`)
      .setParameters(subQuery.getParameters())
      .orderBy('history.historyCreatedAt', 'DESC')
      .getMany();
  }
}
