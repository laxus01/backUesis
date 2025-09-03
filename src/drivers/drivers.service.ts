import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver) private repo: Repository<Driver>,
  ) { }

  async findAll() {
    const drivers = await this.repo.find({ relations: ['eps', 'arl'] });
    return drivers.map(driver => this._transformDriver(driver));
  }
  async findOne(id: number) {
    const driver = await this.repo.findOne({ where: { id }, relations: ['eps', 'arl'] });
    if (!driver) {
      throw new HttpException('Driver not found', HttpStatus.NOT_FOUND);
    }
    return this._transformDriver(driver);
  }

  async searchByIdentification(q: string) {
    const drivers = await this.repo.find({ where: { identification: Like(`${q}%`) }, take: 20, relations: ['eps', 'arl'] });
    return drivers.map(driver => this._transformDriver(driver));
  }

  async create(data: CreateDriverDto) {
    try {
      const entity = this.repo.create(this._dtoToEntity(data));
      const savedDriver = await this.repo.save(entity);
      return this._transformDriver(savedDriver);
    } catch (error) {
      this._handleError(error);
    }
  }

  async createMany(data: CreateDriverDto[]) {
    const created: any[] = [];
    const errors: { input: CreateDriverDto; reason: string }[] = [];

    for (const dto of data) {
      try {
        const entity = this.repo.create(this._dtoToEntity(dto));
        const savedDriver = await this.repo.save(entity);
        created.push(this._transformDriver(savedDriver));
      } catch (error) {
        const reason = error.code === 'ER_DUP_ENTRY' ? 'Driver already exists (duplicate identification)' : 'Error creating driver';
        errors.push({ input: dto, reason });
      }
    }

    return { created, failed: errors };
  }

  async update(id: number, data: UpdateDriverDto) {
    const driverToUpdate = await this.repo.preload({
      id,
      ...this._dtoToEntity(data),
    });

    if (!driverToUpdate) {
      throw new HttpException('Driver not found', HttpStatus.NOT_FOUND);
    }

    try {
      const savedDriver = await this.repo.save(driverToUpdate);
      return this._transformDriver(savedDriver);
    } catch (error) {
      this._handleError(error);
    }
  }

  async remove(id: number) {
    // findOne will throw NOT_FOUND if it doesn't exist
    const driver = await this.repo.findOne({ where: { id } });
    if (!driver) {
        throw new HttpException('Driver not found', HttpStatus.NOT_FOUND);
    }
    return this.repo.remove(driver);
  }

  private _dtoToEntity(data: CreateDriverDto | UpdateDriverDto): Partial<Driver> {
    const { epsId, arlId, ...rest } = data;
    const entity: Partial<Driver> = { ...rest };

    if (epsId !== undefined) {
      entity.eps = epsId ? { id: epsId } as any : null;
    }

    if (arlId !== undefined) {
      entity.arl = arlId ? { id: arlId } as any : null;
    }

    return entity;
  }

  private _transformDriver(driver: Driver) {
    if (!driver) return null;
    const { eps, arl, ...rest } = driver;
    return {
      ...rest,
      epsId: eps?.id ?? null,
      arlId: arl?.id ?? null,
    };
  }

  private _handleError(error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new HttpException('Driver already exists (duplicate identification)', HttpStatus.CONFLICT);
    }
    throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
