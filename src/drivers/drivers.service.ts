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
  ) {}

  findAll() { return this.repo.find(); }
  findOne(id: number) { return this.repo.findOne({ where: { id }, relations: ['eps', 'arl'] }); }

  // Search by identification prefix (realtime autocomplete)
  searchByIdentification(q: string) {
    // Using prefix match; adjust to `%${q}%` for contains if needed
    return this.repo.find({ where: { identification: Like(`${q}%`) }, take: 20, relations: ['eps', 'arl'] });
  }

  async create(data: CreateDriverDto) {
    try {
      const entity = this.repo.create({
        identification: data.identification,
        issuedIn: data.issuedIn,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        license: data.license,
        category: data.category,
        expiresOn: data.expiresOn,
        bloodType: data.bloodType,
        photo: data.photo,
        eps: data.epsId ? ({ id: data.epsId } as any) : undefined,
        arl: data.arlId ? ({ id: data.arlId } as any) : undefined,
      });
      return await this.repo.save(entity);
    } catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY') throw new HttpException('Driver already exists (duplicate identification)', HttpStatus.CONFLICT);
      throw new HttpException('Error creating driver', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, data: UpdateDriverDto) {
    const existing = await this.findOne(id);
    if (!existing) throw new HttpException('Driver not found', HttpStatus.NOT_FOUND);

    if (data.identification !== undefined) existing.identification = data.identification;
    if (data.issuedIn !== undefined) existing.issuedIn = data.issuedIn;
    if (data.firstName !== undefined) existing.firstName = data.firstName;
    if (data.lastName !== undefined) existing.lastName = data.lastName;
    if (data.phone !== undefined) existing.phone = data.phone;
    if (data.address !== undefined) existing.address = data.address;
    if (data.license !== undefined) existing.license = data.license;
    if (data.category !== undefined) existing.category = data.category;
    if (data.expiresOn !== undefined) existing.expiresOn = data.expiresOn as any;
    if (data.bloodType !== undefined) existing.bloodType = data.bloodType;
    if (data.photo !== undefined) existing.photo = data.photo;
    if (data.epsId !== undefined) existing.eps = data.epsId ? ({ id: data.epsId } as any) : null as any;
    if (data.arlId !== undefined) existing.arl = data.arlId ? ({ id: data.arlId } as any) : null as any;

    try { return await this.repo.save(existing); }
    catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY') throw new HttpException('Driver already exists (duplicate identification)', HttpStatus.CONFLICT);
      throw new HttpException('Error updating driver', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    if (!existing) throw new HttpException('Driver not found', HttpStatus.NOT_FOUND);
    return this.repo.remove(existing);
  }
}
