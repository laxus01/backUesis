import { Body, Controller, Param, ParseIntPipe, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { TaxiCertificateDto } from './dto/taxi-certificate.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) { }

  @Post('taxi-certificate/:ownerId')
  async getTaxiCertificate(
    @Param('ownerId', ParseIntPipe) ownerId: number,
    @Body() dto: TaxiCertificateDto,
    @Res() res: Response,
  ) {
    await this.documentsService.generateTaxiCertificate(ownerId, dto, res);
    // Do not return anything when using @Res to stream
  }
}
