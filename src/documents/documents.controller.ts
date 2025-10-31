import { Body, Controller, Headers, Param, ParseIntPipe, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { TaxiCertificateDto } from './dto/taxi-certificate.dto';
import { WorkCertificateDto } from './dto/work-certificate.dto';
import { OwnerCertificateDto } from './dto/owner-certificate.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) { }

  @Post('taxi-certificate/:ownerId')
  async getTaxiCertificate(
    @Param('ownerId', ParseIntPipe) ownerId: number,
    @Body() dto: TaxiCertificateDto,
    @Headers('companyId') companyId: string,
    @Res() res: Response,
  ) {
    const companyIdNumber = companyId ? parseInt(companyId, 10) : undefined;
    await this.documentsService.generateTaxiCertificate(ownerId, dto, companyIdNumber, res);
    // Do not return anything when using @Res to stream
  }

  @Post('work-certificate/:driverId')
  async getWorkCertificate(
    @Param('driverId', ParseIntPipe) driverId: number,
    @Body() dto: WorkCertificateDto,
    @Headers('companyId') companyId: string,
    @Res() res: Response,
  ) {
    const companyIdNumber = companyId ? parseInt(companyId, 10) : undefined;
    await this.documentsService.generateWorkCertificate(driverId, dto, companyIdNumber, res);
    // Do not return anything when using @Res to stream
  }

  @Post('owner-certificate/:ownerId/:vehicleId')
  async getOwnerCertificate(
    @Param('ownerId', ParseIntPipe) ownerId: number,
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Body() dto: OwnerCertificateDto,
    @Headers('companyId') companyId: string,
    @Res() res: Response,
  ) {
    const companyIdNumber = companyId ? parseInt(companyId, 10) : undefined;
    await this.documentsService.generateOwnerCertificate(ownerId, vehicleId, dto, companyIdNumber, res);
    // Do not return anything when using @Res to stream
  }
}
