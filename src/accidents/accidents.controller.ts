import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Headers, 
  Param, 
  ParseIntPipe, 
  Post, 
  Patch,
  Query,
  BadRequestException 
} from '@nestjs/common';
import { AccidentsService } from './accidents.service';
import { CreateAccidentDto } from './dto/create-accident.dto';
import { UpdateAccidentDto } from './dto/update-accident.dto';
import { QueryAccidentDto } from './dto/query-accident.dto';

@Controller('accidents')
export class AccidentsController {
  constructor(private readonly accidentsService: AccidentsService) {}

  @Post()
  async create(
    @Body() dto: CreateAccidentDto,
    @Headers('companyId') companyId?: string,
  ) {
    return this.accidentsService.create(dto, companyId ? parseInt(companyId) : undefined);
  }

  @Get()
  async findAll(
    @Query() query: QueryAccidentDto,
    @Headers('companyId') companyId?: string,
  ) {
    return this.accidentsService.findAll(query, companyId ? parseInt(companyId) : undefined);
  }

  @Get('vehicle/:vehicleId')
  async findByVehicle(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Headers('companyId') companyId?: string,
  ) {
    return this.accidentsService.findByVehicle(vehicleId, companyId ? parseInt(companyId) : undefined);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('companyId') companyId?: string,
  ) {
    return this.accidentsService.findOne(id, companyId ? parseInt(companyId) : undefined);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAccidentDto,
    @Headers('companyId') companyId?: string,
  ) {
    return this.accidentsService.update(id, dto, companyId ? parseInt(companyId) : undefined);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Headers('companyId') companyId?: string,
  ) {
    return this.accidentsService.remove(id, companyId ? parseInt(companyId) : undefined);
  }
}
