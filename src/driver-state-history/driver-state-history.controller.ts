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
import { DriverStateHistoryService } from './driver-state-history.service';
import { QueryDriverStateHistoryDto } from './dto/query-driver-state-history.dto';
import { UpdateReasonDto } from './dto/update-reason.dto';

@Controller('driver-state-history')
export class DriverStateHistoryController {
  constructor(private readonly service: DriverStateHistoryService) {}

  @Get('driver/:driverId')
  findByDriverId(
    @Param('driverId', ParseIntPipe) driverId: number,
    @Query() query: QueryDriverStateHistoryDto,
  ) {
    return this.service.findByDriverId(driverId, query);
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
