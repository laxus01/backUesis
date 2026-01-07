import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { VehicleStateHistoryService } from './vehicle-state-history.service';
import { QueryVehicleStateHistoryDto } from './dto/query-vehicle-state-history.dto';
import { UpdateReasonDto } from './dto/update-reason.dto';

@Controller('vehicle-state-history')
export class VehicleStateHistoryController {
  constructor(private readonly service: VehicleStateHistoryService) {}

  @Get('vehicle/:vehicleId')
  findByVehicleId(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Query() query: QueryVehicleStateHistoryDto,
  ) {
    return this.service.findByVehicleId(vehicleId, query);
  }

  @Patch(':id/reason')
  updateReason(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReasonDto: UpdateReasonDto,
  ) {
    return this.service.updateReason(id, updateReasonDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
