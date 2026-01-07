import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverStateHistory } from './entities/driver-state-history.entity';
import { QueryDriverStateHistoryDto } from './dto/query-driver-state-history.dto';
import { UpdateReasonDto } from './dto/update-reason.dto';

@Injectable()
export class DriverStateHistoryService {
  constructor(
    @InjectRepository(DriverStateHistory)
    private historyRepo: Repository<DriverStateHistory>,
  ) {}

  async findByDriverId(driverId: number, query?: QueryDriverStateHistoryDto) {
    const queryBuilder = this.historyRepo
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.driver', 'driver')
      .where('history.driver_id = :driverId', { driverId });

    if (query?.previousState !== undefined) {
      queryBuilder.andWhere('history.previous_state = :previousState', {
        previousState: query.previousState,
      });
    }

    if (query?.newState !== undefined) {
      queryBuilder.andWhere('history.new_state = :newState', {
        newState: query.newState,
      });
    }

    if (query?.fromDate) {
      queryBuilder.andWhere('DATE(history.created_at) >= :fromDate', {
        fromDate: query.fromDate,
      });
    }

    if (query?.toDate) {
      queryBuilder.andWhere('DATE(history.created_at) <= :toDate', {
        toDate: query.toDate,
      });
    }

    return queryBuilder.orderBy('history.created_at', 'DESC').getMany();
  }

  async updateReason(id: number, updateReasonDto: UpdateReasonDto) {
    const record = await this.historyRepo.findOne({ where: { id } });

    if (!record) {
      throw new NotFoundException(`Registro con ID ${id} no encontrado`);
    }

    record.reason = updateReasonDto.reason;
    return this.historyRepo.save(record);
  }

  async remove(id: number) {
    const record = await this.historyRepo.findOne({ where: { id } });

    if (!record) {
      throw new NotFoundException(`Registro con ID ${id} no encontrado`);
    }

    await this.historyRepo.remove(record);
    return { message: `Registro con ID ${id} eliminado exitosamente` };
  }
}
