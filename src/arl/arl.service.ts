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
  ) {}

  findAll() { return this.repo.find(); }
  findOne(id: number) { return this.repo.findOne({ where: { id } }); }

  async create(data: CreateArlDto) {
    try { return await this.repo.save(this.repo.create(data)); }
    catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY') throw new HttpException('Arl already exists', HttpStatus.CONFLICT);
      throw new HttpException('Error creating arl', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, data: UpdateArlDto) {
    const existing = await this.findOne(id);
    if (!existing) throw new HttpException('Arl not found', HttpStatus.NOT_FOUND);
    Object.assign(existing, data);
    return this.repo.save(existing);
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    if (!existing) throw new HttpException('Arl not found', HttpStatus.NOT_FOUND);
    return this.repo.remove(existing);
  }
}
