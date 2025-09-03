import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Arl } from './entities/arl.entity';
import { CreateArlDto } from './dto/create-arl.dto';
import { UpdateArlDto } from './dto/update-arl.dto';

@Injectable()
export class ArlService {
  constructor(
    @InjectRepository(Arl) private repo: Repository<Arl>,
  ) { }

  findAll() { return this.repo.find(); }
  async findOne(id: number) {
    const arl = await this.repo.findOne({ where: { id } });
    if (!arl) {
      throw new HttpException('Arl not found', HttpStatus.NOT_FOUND);
    }
    return arl;
  }

  async create(data: CreateArlDto) {
    try {
      const newArl = this.repo.create(data);
      return await this.repo.save(newArl);
    } catch (error) {
      this._handleError(error);
    }
  }

  async update(id: number, data: UpdateArlDto) {
    const arlToUpdate = await this.repo.preload({ id, ...data });

    if (!arlToUpdate) {
      throw new HttpException('Arl not found', HttpStatus.NOT_FOUND);
    }

    try {
      return await this.repo.save(arlToUpdate);
    } catch (error) {
      this._handleError(error);
    }
  }

  async remove(id: number) {
    const arl = await this.findOne(id);
    return this.repo.remove(arl);
  }

  private _handleError(error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new HttpException('Arl already exists', HttpStatus.CONFLICT);
    }
    throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
