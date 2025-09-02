import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunicationCompany } from './entities/communication-company.entity';
import { CreateCommunicationCompanyDto } from './dto/create-communication-company.dto';
import { UpdateCommunicationCompanyDto } from './dto/update-communication-company.dto';

@Injectable()
export class CommunicationCompanyService {
  constructor(
    @InjectRepository(CommunicationCompany) private repo: Repository<CommunicationCompany>,
  ) {}

  findAll() { return this.repo.find(); }
  findOne(id: number) { return this.repo.findOne({ where: { id } }); }

  async create(data: CreateCommunicationCompanyDto) {
    try { return await this.repo.save(this.repo.create(data)); }
    catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY') throw new HttpException('Communication company already exists', HttpStatus.CONFLICT);
      throw new HttpException('Error creating communication company', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, data: UpdateCommunicationCompanyDto) {
    const existing = await this.findOne(id);
    if (!existing) throw new HttpException('Communication company not found', HttpStatus.NOT_FOUND);
    Object.assign(existing, data);
    return this.repo.save(existing);
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    if (!existing) throw new HttpException('Communication company not found', HttpStatus.NOT_FOUND);
    return this.repo.remove(existing);
  }
}
