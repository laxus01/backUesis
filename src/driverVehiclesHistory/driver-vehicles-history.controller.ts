import { Controller, Get, Headers, Query } from '@nestjs/common';
import { DriverVehiclesHistoryService } from './driver-vehicles-history.service';
import { QueryDriverVehicleHistoryDto } from './dto/query-driver-vehicle-history.dto';

@Controller('driver-vehicles-history')
export class DriverVehiclesHistoryController {
  constructor(private readonly service: DriverVehiclesHistoryService) { }

  @Get()
  findHistory(@Headers('companyId') companyId: string, @Query() query: QueryDriverVehicleHistoryDto) {
    return this.service.findHistory(query, companyId ? Number(companyId) : undefined);
  }
}
