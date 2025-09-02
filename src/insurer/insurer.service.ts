import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Insurer } from './entities/insurer.entity';
import { CreateInsurerDto } from './dto/create-insurer.dto';
import { UpdateInsurerDto } from './dto/update-insurer.dto';

@Injectable()
export class InsurerService {
  constructor(
    @InjectRepository(Insurer) private repo: Repository<Insurer>,
  ) {}

  findAll() { return this.repo.find(); }
  findOne(id: number) { return this.repo.findOne({ where: { id } }); }

  async create(data: CreateInsurerDto) {
    try { return await this.repo.save(this.repo.create(data)); }
    catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY') throw new HttpException('Insurer already exists', HttpStatus.CONFLICT);
      throw new HttpException('Error creating insurer', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, data: UpdateInsurerDto) {
    const existing = await this.findOne(id);
    if (!existing) throw new HttpException('Insurer not found', HttpStatus.NOT_FOUND);
    Object.assign(existing, data);
    return this.repo.save(existing);
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    if (!existing) throw new HttpException('Insurer not found', HttpStatus.NOT_FOUND);
    return this.repo.remove(existing);
  }
}
