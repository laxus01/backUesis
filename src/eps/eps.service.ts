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
  ) {}

  findAll() { return this.repo.find(); }
  findOne(id: number) { return this.repo.findOne({ where: { id } }); }

  async create(data: CreateEpsDto) {
    try { return await this.repo.save(this.repo.create(data)); }
    catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY') throw new HttpException('Eps already exists', HttpStatus.CONFLICT);
      throw new HttpException('Error creating eps', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, data: UpdateEpsDto) {
    const existing = await this.findOne(id);
    if (!existing) throw new HttpException('Eps not found', HttpStatus.NOT_FOUND);
    Object.assign(existing, data);
    return this.repo.save(existing);
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    if (!existing) throw new HttpException('Eps not found', HttpStatus.NOT_FOUND);
    return this.repo.remove(existing);
  }
}
