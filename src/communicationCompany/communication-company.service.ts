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
  ) { }

  findAll() { return this.repo.find(); }
  async findOne(id: number) {
    const company = await this.repo.findOne({ where: { id } });
    if (!company) {
      throw new HttpException('Communication company not found', HttpStatus.NOT_FOUND);
    }
    return company;
  }

  async create(data: CreateCommunicationCompanyDto) {
    try {
      const newCompany = this.repo.create(data);
      return await this.repo.save(newCompany);
    } catch (error) {
      this._handleError(error);
    }
  }

  async update(id: number, data: UpdateCommunicationCompanyDto) {
    const companyToUpdate = await this.repo.preload({ id, ...data });

    if (!companyToUpdate) {
      throw new HttpException('Communication company not found', HttpStatus.NOT_FOUND);
    }

    try {
      return await this.repo.save(companyToUpdate);
    } catch (error) {
      this._handleError(error);
    }
  }

  async remove(id: number) {
    const company = await this.findOne(id);
    return this.repo.remove(company);
  }

  private _handleError(error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new HttpException('Communication company already exists', HttpStatus.CONFLICT);
    }
    throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
