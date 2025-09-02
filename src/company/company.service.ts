import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company) private repo: Repository<Company>,
  ) {}

  findAll() { return this.repo.find(); }
  findOne(id: number) { return this.repo.findOne({ where: { id } }); }

  async create(data: CreateCompanyDto) {
    try { return await this.repo.save(this.repo.create(data)); }
    catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY') throw new HttpException('Company already exists', HttpStatus.CONFLICT);
      throw new HttpException('Error creating company', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, data: UpdateCompanyDto) {
    const existing = await this.findOne(id);
    if (!existing) throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
    Object.assign(existing, data);
    return this.repo.save(existing);
    }

  async remove(id: number) {
    const existing = await this.findOne(id);
    if (!existing) throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
    return this.repo.remove(existing);
  }
}
