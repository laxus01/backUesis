import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Owner } from './entities/owner.entity';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';

@Injectable()
export class OwnerService {
  constructor(
    @InjectRepository(Owner) private repo: Repository<Owner>,
  ) {}

  findAll() { return this.repo.find(); }
  findOne(id: number) { return this.repo.findOne({ where: { id } }); }

  async create(data: CreateOwnerDto) {
    try { return await this.repo.save(this.repo.create(data)); }
    catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY') throw new HttpException('Owner already exists', HttpStatus.CONFLICT);
      throw new HttpException('Error creating owner', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, data: UpdateOwnerDto) {
    const existing = await this.findOne(id);
    if (!existing) throw new HttpException('Owner not found', HttpStatus.NOT_FOUND);
    Object.assign(existing, data);
    return this.repo.save(existing);
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    if (!existing) throw new HttpException('Owner not found', HttpStatus.NOT_FOUND);
    return this.repo.remove(existing);
  }
}
