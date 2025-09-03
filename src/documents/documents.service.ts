import { BadRequestException, Injectable, NotFoundException, Res } from '@nestjs/common';
// Use CommonJS require to avoid ESM default interop issues at runtime
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');
import { Response } from 'express';
import { existsSync } from 'fs';
import { join } from 'path';
import { OwnerService } from '../owner/owner.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { TaxiCertificateDto } from './dto/taxi-certificate.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly ownerService: OwnerService,
    private readonly vehiclesService: VehiclesService,
  ) {}

  async generateTaxiCertificate(ownerId: number, dto: TaxiCertificateDto, @Res() res: Response) {
    // Fetch data before starting PDF stream
    const owner = await this.ownerService.findOne(ownerId);
    if (!owner) throw new NotFoundException('Owner not found');
    const vehicle = await this.vehiclesService.findByOwnerId(ownerId);
    if (!vehicle) throw new NotFoundException('Vehicle for owner not found');
    if (!dto || typeof dto.amountNumber !== 'number' || !isFinite(dto.amountNumber) || !dto.amountWords) {
      throw new BadRequestException('amountNumber (number) and amountWords (string) are required');
    }
    const doc = new PDFDocument({ margin: 50 });

    // HTTP headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=certificado_taxi.pdf');

    // Start piping
    doc.pipe(res);

    // Try to use a Unicode-capable font if available to render accents/UTF-8
    const unicodeFont = join(process.cwd(), 'assets', 'fonts', 'DejaVuSans.ttf');
    const unicodeBoldFont = join(process.cwd(), 'assets', 'fonts', 'DejaVuSans-Bold.ttf');
    if (existsSync(unicodeFont)) {
      doc.font(unicodeFont);
    } else {
      // Fallback to built-in font (limited charset)
      doc.font('Helvetica');
    }
    // Ensure text color is visible
    doc.opacity(1).fillColor('black');

    // Set some metadata
    doc.info = {
      Title: 'Certificado Taxi',
      Author: 'Cootranscas',
      Subject: 'Certificado de ingresos y vehículo',
      Keywords: 'taxi, certificado, cootranscas',
      CreationDate: new Date(),
    } as any;


    const sanitize = (s: string) =>
      s
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'");

    doc.moveDown(6);

    // Intro paragraph in bold
    if (existsSync(unicodeBoldFont)) {
      doc.font(unicodeBoldFont);
    } else {
      doc.font('Helvetica-Bold');
    }
    doc
      .fontSize(12)
      .text(
        sanitize('EL SUSCRITO GERENTE Y REPRESENTANTE LEGAL DE LA COOPERATIVA DE TRANSPORTE DE CONDUCTORES ASOCIADOS DE SINCELEJO “COOTRANSCAS”'),
        {
          align: 'center'
        },
      );
    // Restore normal font
    if (existsSync(unicodeFont)) {
      doc.font(unicodeFont);
    } else {
      doc.font('Helvetica');
    }

    doc.moveDown(2);

    // Certificate heading (bold)
    if (existsSync(unicodeBoldFont)) {
      doc.font(unicodeBoldFont);
    } else {
      // Fallback bold font
      doc.font('Helvetica-Bold');
    }
    doc.fontSize(12).text('CERTIFICA QUE:', { align: 'center' });
    // Restore normal font
    if (existsSync(unicodeFont)) {
      doc.font(unicodeFont);
    } else {
      doc.font('Helvetica');
    }

    doc.moveDown();

    const entryDate = vehicle.entryDate ? new Date(vehicle.entryDate).toLocaleDateString('es-CO') : 'N/D';
    const ownerName = owner.name ?? 'N/D';
    const ownerIdentification = owner.identification ?? 'N/D';
    // Owner paragraph with owner's name in bold
    doc.fontSize(12);
    doc.text(sanitize('El señor (a) '), { continued: true, align: 'justify', lineBreak: false });
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text(sanitize(ownerName), { continued: true, lineBreak: false });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text(
      sanitize(`, identificado con la cédula de ciudadanía No. ${ownerIdentification}, tiene afiliado a esta empresa un vehículo de su propiedad desde el ${entryDate}, cuyas características se detallan más adelante,`),
      { continued: true, align: 'justify', lineBreak: false },
    );

    // Immediately continue with income sentence after the previous phrase
    const amountNumberFormatted = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(dto.amountNumber);
    // Income sentence with amount words and number in bold
    doc.fontSize(12);
    doc.text(sanitize('el cual genera unos Ingresos Mensuales de '), { continued: true, align: 'justify', lineBreak: false });
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text(sanitize(dto.amountWords), { continued: true, lineBreak: false });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text(sanitize(' ('), { continued: true, lineBreak: false });
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text(amountNumberFormatted, { continued: true, lineBreak: false });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text(sanitize('), los que recibe directamente su propietario.'), { align: 'justify', lineBreak: false });

    doc.moveDown(2);

    const dataPairsRaw: [string, string | undefined | null][] = [
      ['NI:', vehicle.internalNumber ?? undefined],
      ['FECHA DE INGRESO:', entryDate],
      ['PLACA:', vehicle.plate],
      ['MARCA:', (vehicle as any).make?.name],
      ['LINEA:', vehicle.line],
      ['MODELO:', vehicle.model],
      ['CLASE:', 'AUTOMOVIL'],
      ['COLOR:', 'AMARILLO'],
      ['SERVICIO:', 'PÚBLICO'],
      [sanitize('N° MOTOR:'), vehicle.engineNumber],
      [sanitize('N° CHASIS:'), vehicle.chassisNumber],
      ['DIRECCION:', owner.address],
      ['TELEFONO:', owner.phone],
    ];

    const vehicleData: [string, string][] = dataPairsRaw
      .map(([k, v]) => {
        const hasValue = v !== undefined && v !== null && String(v).trim().length > 0;
        return [k, hasValue ? String(v) : 'SIN REGISTRAR'];
      });

    vehicleData.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(label, { continued: true });
      doc.font('Helvetica').text(` ${value}`);
    });

    doc.moveDown(2);

    // Footer with signature
    const now = new Date();
    const day = now.getDate();
    const monthName = now.toLocaleDateString('es-CO', { month: 'long' });
    const year = now.getFullYear();
    doc
      .fontSize(12)
      .text(sanitize(`Para constancia se firma en Sincelejo a los ${day} días del mes de ${monthName} de ${year}`), {
        align: 'justify',
      });

    doc.moveDown(4);

    doc.text('_____________________________');
    doc.text('CALIXTO E. TUÑON MARTINEZ');
    doc.text('Gerente');
    doc.text('Cel- 302-4129946');

    // End document
    doc.end();
  }
}
