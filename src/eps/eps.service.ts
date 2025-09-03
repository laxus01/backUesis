import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Eps } from './entities/eps.entity';
import { CreateEpsDto } from './dto/create-eps.dto';
import { UpdateEpsDto } from './dto/update-eps.dto';

@Injectable()
export class EpsService {
  constructor(
    @InjectRepository(Eps) private repo: Repository<Eps>,
  ) { }

  findAll() { return this.repo.find(); }
  async findOne(id: number) {
    const eps = await this.repo.findOne({ where: { id } });
    if (!eps) {
      throw new HttpException('Eps not found', HttpStatus.NOT_FOUND);
    }
    return eps;
  }

  async create(data: CreateEpsDto) {
    try {
      const newEps = this.repo.create(data);
      return await this.repo.save(newEps);
    } catch (error) {
      this._handleError(error);
    }
  }

  async update(id: number, data: UpdateEpsDto) {
    const epsToUpdate = await this.repo.preload({ id, ...data });

    if (!epsToUpdate) {
      throw new HttpException('Eps not found', HttpStatus.NOT_FOUND);
    }

    try {
      return await this.repo.save(epsToUpdate);
    } catch (error) {
      this._handleError(error);
    }
  }

  async remove(id: number) {
    const eps = await this.findOne(id);
    return this.repo.remove(eps);
  }

  private _handleError(error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new HttpException('Eps already exists', HttpStatus.CONFLICT);
    }
    throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
