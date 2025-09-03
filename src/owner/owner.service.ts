import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Owner } from './entities/owner.entity';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';

@Injectable()
export class OwnerService {
  constructor(
    @InjectRepository(Owner) private repo: Repository<Owner>,
  ) { }

  findAll(name?: string, identification?: string) {
    const where: any = {};
    if (name) where.name = Like(`%${name}%`);
    if (identification) where.identification = Like(`%${identification}%`);
    return this.repo.find({ where });
  }
  findOne(id: number) { return this.repo.findOne({ where: { id } }); }

  async create(data: CreateOwnerDto) {
    try { return await this.repo.save(this.repo.create(data)); }
    catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY') throw new HttpException('Owner already exists', HttpStatus.CONFLICT);
      throw new HttpException('Error creating owner', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createMany(dtos: CreateOwnerDto[]) {
    const created: Owner[] = [];
    const failed: Array<{ input: CreateOwnerDto; reason: string }> = [];
    for (const data of dtos) {
      try {
        const saved = await this.repo.save(this.repo.create(data));
        created.push(saved);
      } catch (e: any) {
        if (e?.code === 'ER_DUP_ENTRY') failed.push({ input: data, reason: 'Owner already exists' });
        else failed.push({ input: data, reason: 'Error creating owner' });
      }
    }
    return { created, failed };
  }

  async update(id: number, data: UpdateOwnerDto) {
    const existing = await this.findOne(id);
    if (!existing) throw new HttpException('Owner not found', HttpStatus.NOT_FOUND);
    Object.assign(existing, data);
    try {
      return await this.repo.save(existing);
    } catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY') {
        throw new HttpException('Identification already in use', HttpStatus.CONFLICT);
      }
      throw new HttpException('Error updating owner', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    if (!existing) throw new HttpException('Owner not found', HttpStatus.NOT_FOUND);
    return this.repo.remove(existing);
  }
}
