import { Controller, Get, Headers, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { DriverVehiclesHistoryService } from './driver-vehicles-history.service';
import { QueryDriverVehicleHistoryDto } from './dto/query-driver-vehicle-history.dto';

@Controller('driver-vehicles-history')
export class DriverVehiclesHistoryController {
  constructor(private readonly service: DriverVehiclesHistoryService) { }

  @Get()
  findHistory(@Headers('companyId') companyId: string, @Query() query: QueryDriverVehicleHistoryDto) {
    return this.service.findHistory(query, companyId ? Number(companyId) : undefined);
  }

  @Get('export/excel')
  async exportToExcel(
    @Res() res: Response,
    @Headers('companyId') companyId: string,
    @Query() query: QueryDriverVehicleHistoryDto
  ) {
    const buffer = await this.service.generateExcelReport(
      query, 
      companyId ? Number(companyId) : undefined
    );

    // Generar nombre de archivo dinámico
    let filename = 'historial_conductor_vehiculo';
    if (query.fromDate || query.toDate) {
      filename += `_${query.fromDate || 'inicio'}_${query.toDate || 'fin'}`;
    }
    filename += `_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }
}
