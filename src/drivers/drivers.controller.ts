import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Controller('drivers')
export class DriversController {
  constructor(private readonly service: DriversService) {}

  @Get()
  async find(@Query('identification') identification?: string) {
    const q = (identification || '').trim();
    if (q) {
      const list: any[] = await this.service.searchByIdentification(q);
      return list.map((d: any) => {
        const { eps, arl, ...rest } = d || {};
        return {
          ...rest,
          epsId: eps?.id ?? null,
          arlId: arl?.id ?? null,
        };
      });
    }
    return this.service.findAll();
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const d: any = await this.service.findOne(Number(id));
    if (!d) return d;
    const { eps, arl, ...rest } = d || {};
    return {
      ...rest,
      epsId: eps?.id ?? null,
      arlId: arl?.id ?? null,
    };
  }
  @Post() create(@Body() data: CreateDriverDto) { return this.service.create(data); }
  @Post('bulk')
  createMany(@Body() body: any) {
    let data: any = body;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch { /* ignore */ }
    }
    if (data && !Array.isArray(data) && Array.isArray((data as any).items)) {
      data = (data as any).items;
    }
    if (!Array.isArray(data)) {
      throw new BadRequestException('Body must be a JSON array of CreateDriverDto');
    }
    return this.service.createMany(data as CreateDriverDto[]);
  }
  @Put(':id') update(@Param('id') id: string, @Body() data: UpdateDriverDto) { return this.service.update(Number(id), data); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(Number(id)); }
}
