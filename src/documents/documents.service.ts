import { BadRequestException, Injectable, NotFoundException, Res } from '@nestjs/common';
// Use CommonJS require to avoid ESM default interop issues at runtime
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');
import { Response } from 'express';
import { existsSync } from 'fs';
import { join } from 'path';
import { OwnerService } from '../owner/owner.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { DriversService } from '../drivers/drivers.service';
import { CompanyService } from '../company/company.service';
import { TaxiCertificateDto } from './dto/taxi-certificate.dto';
import { WorkCertificateDto } from './dto/work-certificate.dto';
import { OwnerCertificateDto } from './dto/owner-certificate.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly ownerService: OwnerService,
    private readonly vehiclesService: VehiclesService,
    private readonly driversService: DriversService,
    private readonly companyService: CompanyService,
  ) { }

  async generateTaxiCertificate(ownerId: number, dto: TaxiCertificateDto, companyId: number | undefined, @Res() res: Response) {
    // Fetch data before starting PDF stream
    const owner = await this.ownerService.findOne(ownerId);
    if (!owner) throw new NotFoundException('Owner not found');
    const vehicle = await this.vehiclesService.findByOwnerId(ownerId);
    if (!vehicle) throw new NotFoundException('Vehicle for owner not found');
    if (!dto || typeof dto.amountNumber !== 'number' || !isFinite(dto.amountNumber) || !dto.amountWords) {
      throw new BadRequestException('amountNumber (number) and amountWords (string) are required');
    }
    
    // Get company data for manager info
    let managerName = 'CALIXTO E. TUÑON MARTINEZ'; // Default
    let managerPhone = '302-4129946'; // Default
    if (companyId) {
      const company = await this.companyService.findOne(companyId);
      if (company) {
        if (company.managerName) managerName = company.managerName.toUpperCase();
        if (company.managerPhone) managerPhone = company.managerPhone;
      }
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

    const entryDateText = vehicle.entryDate ? new Date(vehicle.entryDate).toLocaleDateString('es-CO') : 'SIN REGISTRAR';
    const entryDateField = vehicle.entryDate ? new Date(vehicle.entryDate).toLocaleDateString('es-CO') : 'SIN REGISTRAR';
    const ownerName = owner.name;
    const ownerIdentification = owner.identification;
    // Owner paragraph with owner's name in bold
    doc.fontSize(12);
    doc.text(sanitize('El señor (a) '), { continued: true, align: 'justify' });
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text(sanitize(ownerName), { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text(
      sanitize(`, identificado con la cédula de ciudadanía No. ${ownerIdentification}, tiene afiliado a esta empresa un vehículo de su propiedad desde el ${entryDateText}, cuyas características se detallan más adelante, `),
      { align: 'justify', continued: true },
    );

    // Immediately continue with income sentence after the previous phrase
    const amountNumberFormatted = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(dto.amountNumber);
    // Income sentence with amount words and number in bold
    doc.fontSize(12);
    doc.text(sanitize('el cual genera unos Ingresos Mensuales de '), { continued: true, align: 'justify' });
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text(sanitize(dto.amountWords), { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text(sanitize(' ('), { continued: true });
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text(amountNumberFormatted, { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text(sanitize('), los que recibe directamente su propietario.'), { align: 'justify' });

    doc.moveDown(2);

    const dataPairsRaw: [string, string | undefined | null][] = [
      ['NI:', vehicle.internalNumber ?? undefined],
      ['FECHA DE INGRESO:', entryDateField],
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

    // Signature block in bold
    if (existsSync(unicodeBoldFont)) {
      doc.font(unicodeBoldFont);
    } else {
      doc.font('Helvetica-Bold');
    }
    doc.text('_____________________________');
    doc.text(managerName);
    doc.text('Gerente');
    if (managerPhone) {
      doc.text(`Cel: ${managerPhone}`);
    }
    // Restore normal font after signature block
    if (existsSync(unicodeFont)) {
      doc.font(unicodeFont);
    } else {
      doc.font('Helvetica');
    }

    // End document
    doc.end();
  }

  async generateWorkCertificate(driverId: number, dto: WorkCertificateDto, companyId: number | undefined, @Res() res: Response) {
    // Fetch data before starting PDF stream
    const driver = await this.driversService.findOne(driverId);
    if (!driver) throw new NotFoundException('Driver not found');
    
    if (!dto || !dto.startDate || !dto.endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }
    
    // Get company data
    let companyName = ''; // Default
    let managerName = 'Gerente'; // Default
    let managerPhone = ''; // Default
    if (companyId) {
      const company = await this.companyService.findOne(companyId);
      if (company) {
        if (company.name) companyName = company.name.toUpperCase();
        if (company.managerName) managerName = company.managerName;
        if (company.managerPhone) managerPhone = company.managerPhone;
      }
    }
    
    const doc = new PDFDocument({ margin: 50 });

    // HTTP headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=certificado_laboral.pdf');

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
      Title: 'Certificado Laboral',
      Author: 'Radio Taxi Satelital S.A.S',
      Subject: 'Certificado de trabajo',
      Keywords: 'certificado, laboral, conductor',
      CreationDate: new Date(),
    } as any;

    const sanitize = (s: string) =>
      s
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'");

    doc.moveDown(6);

    // Title heading (bold and centered)
    if (existsSync(unicodeBoldFont)) {
      doc.font(unicodeBoldFont);
    } else {
      doc.font('Helvetica-Bold');
    }
    doc.fontSize(14).text('CERTIFICACION:', { align: 'center' });
    
    // Restore normal font
    if (existsSync(unicodeFont)) {
      doc.font(unicodeFont);
    } else {
      doc.font('Helvetica');
    }

    doc.moveDown(4);

    // Main paragraph
    const driverName = `${driver.firstName} ${driver.lastName}`.toUpperCase();
    const driverIdentification = driver.identification;
    const issuedIn = driver.issuedIn || 'Sincelejo (Sucre)'; // Fallback si no está definido
    
    doc.fontSize(12);
    doc.text(
      sanitize(`${companyName} CERTIFICA QUE: El señor `),
      { continued: true, align: 'justify' }
    );
    
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text(sanitize(driverName), { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    
    doc.text(
      sanitize(` identificado con la cédula de ciudadanía No. ${driverIdentification} expedida en ${issuedIn}, ha laborado como conductor en vehículos tipo taxi afiliados a esta empresa, desde el ${dto.startDate} hasta ${dto.endDate}, destacándose por su responsabilidad, amabilidad, sencillez, honradez, trabajo en equipo, dominio de las normas de tránsito y sentido de pertenencia.`),
      { align: 'justify' }
    );

    doc.moveDown(3);

    // Footer with date
    const now = new Date();
    const day = now.getDate();
    const monthName = now.toLocaleDateString('es-CO', { month: 'long' });
    const year = now.getFullYear();
    doc
      .fontSize(12)
      .text(
        sanitize(`La presente certificación se expide a solicitud del interesado a los ${day} (${this.numberToWords(day)}) días del mes de ${monthName} de ${year}.`),
        { align: 'justify' }
      );

    doc.moveDown(4);

    // Signature block
    if (existsSync(unicodeBoldFont)) {
      doc.font(unicodeBoldFont);
    } else {
      doc.font('Helvetica-Bold');
    }
    doc.text('_____________________________', { align: 'left' });
    doc.text(managerName.toUpperCase(), { align: 'left' });
    doc.text('Gerente', { align: 'left' });
    if (managerPhone) {
      doc.text(`Cel: ${managerPhone}`, { align: 'left' });
    }
    
    // Restore normal font after signature block
    if (existsSync(unicodeFont)) {
      doc.font(unicodeFont);
    } else {
      doc.font('Helvetica');
    }

    // End document
    doc.end();
  }

  async generateOwnerCertificate(ownerId: number, vehicleId: number, dto: OwnerCertificateDto, companyId: number | undefined, @Res() res: Response) {
    // Fetch data before starting PDF stream
    const owner = await this.ownerService.findOne(ownerId);
    if (!owner) throw new NotFoundException('Owner not found');
    
    const vehicle = await this.vehiclesService.findOne(vehicleId);
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    
    // Validate that the vehicle belongs to the owner
    if ((vehicle as any).owner?.id !== ownerId) {
      throw new BadRequestException('Vehicle does not belong to the specified owner');
    }
    
    if (!dto || typeof dto.amountNumber !== 'number' || !isFinite(dto.amountNumber) || !dto.amountWords) {
      throw new BadRequestException('amountNumber (number) and amountWords (string) are required');
    }
    
    // Get company data
    let companyName = ''; // Default
    let managerName = 'Gerente'; // Default
    let managerPhone = ''; // Default
    if (companyId) {
      const company = await this.companyService.findOne(companyId);
      if (company) {
        if (company.name) companyName = company.name.toUpperCase();
        if (company.managerName) managerName = company.managerName;
        if (company.managerPhone) managerPhone = company.managerPhone;
      }
    }
    
    const doc = new PDFDocument({ margin: 50 });

    // HTTP headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=certificado_propietario.pdf');

    // Start piping
    doc.pipe(res);

    // Try to use a Unicode-capable font if available to render accents/UTF-8
    const unicodeFont = join(process.cwd(), 'assets', 'fonts', 'DejaVuSans.ttf');
    const unicodeBoldFont = join(process.cwd(), 'assets', 'fonts', 'DejaVuSans-Bold.ttf');
    if (existsSync(unicodeFont)) {
      doc.font(unicodeFont);
    } else {
      doc.font('Helvetica');
    }
    // Ensure text color is visible
    doc.opacity(1).fillColor('black');

    // Set some metadata
    doc.info = {
      Title: 'Certificado Propietario',
      Author: companyName || 'Empresa',
      Subject: 'Certificado de propiedad de vehículo',
      Keywords: 'certificado, propietario, vehículo',
      CreationDate: new Date(),
    } as any;

    const sanitize = (s: string) =>
      s
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'");

    doc.moveDown(4);

    // Title
    if (existsSync(unicodeBoldFont)) {
      doc.font(unicodeBoldFont);
    } else {
      doc.font('Helvetica-Bold');
    }
    doc.fontSize(14).text('CERTIFICACION:', { align: 'center' });
    
    // Restore normal font
    if (existsSync(unicodeFont)) {
      doc.font(unicodeFont);
    } else {
      doc.font('Helvetica');
    }

    doc.moveDown(3);

    // Main paragraph
    const ownerName = owner.name.toUpperCase();
    const ownerIdentification = owner.identification;
    const ownerIssuedIn = owner.issuedIn; // Default value
    const vehiclePlate = vehicle.plate;
    const vehicleModel = vehicle.model;
    const vehicleMake = (vehicle as any).make?.name || 'N/A';
    const vehicleColor = vehicle.color || 'amarillo';
    const entryDate = vehicle.entryDate ? new Date(vehicle.entryDate).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';
    
    const amountFormatted = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(dto.amountNumber);

    doc.fontSize(12);
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text(sanitize(`${companyName} CERTIFICA QUE: `), { continued: true, align: 'justify' });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text(sanitize(`${ownerName} `), { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    
    doc.text(
      sanitize(` identificado(a) con la cédula de ciudadanía No. ${ownerIdentification} expedida en ${ownerIssuedIn}, es propietario de un (1) vehículo público (Taxi) de placa `),
      { continued: true, align: 'justify' }
    );
    
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text(sanitize(vehiclePlate), { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    
    doc.text(
      sanitize(`, Modelo ${vehicleModel}, Marca ${vehicleMake}, vinculado a la empresa de transporte mediante contrato desde el once (11) de Diciembre del 2.006, color ${vehicleColor}.`),
      { align: 'justify' }
    );

    doc.moveDown(2);

    // Income paragraph
    doc.fontSize(12);
    doc.text(
      sanitize('Este vehículo le representa a su propietario ingresos mensuales de: '),
      { continued: true, align: 'justify' }
    );
    
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text(sanitize(dto.amountWords.toUpperCase()), { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    
    doc.text(sanitize(' ('), { continued: true });
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text(sanitize(amountFormatted), { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text(sanitize(')'), { align: 'justify' });

    doc.moveDown(2);

    // Footer with date
    const now = new Date();
    const day = now.getDate();
    const monthName = now.toLocaleDateString('es-CO', { month: 'long' });
    const year = now.getFullYear();
    doc
      .fontSize(12)
      .text(
        sanitize(`La presente certificación se expide a solicitud del interesado a los diez (${day}) días del mes de ${monthName} del ${year}.`),
        { align: 'justify' }
      );

    doc.moveDown(4);

    // Signature block
    if (existsSync(unicodeBoldFont)) {
      doc.font(unicodeBoldFont);
    } else {
      doc.font('Helvetica-Bold');
    }
    doc.text('_____________________________', { align: 'left' });
    doc.text(managerName.toUpperCase(), { align: 'left' });
    doc.text('Gerente', { align: 'left' });
    if (managerPhone) {
      doc.text(`Cel: ${managerPhone}`, { align: 'left' });
    }
    
    // Restore normal font after signature block
    if (existsSync(unicodeFont)) {
      doc.font(unicodeFont);
    } else {
      doc.font('Helvetica');
    }

    // End document
    doc.end();
  }

  private numberToWords(num: number): string {
    const ones = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    
    if (num === 0) return 'cero';
    if (num < 10) return ones[num];
    if (num >= 10 && num < 20) return teens[num - 10];
    if (num >= 20 && num < 30) {
      if (num === 20) return 'veinte';
      return 'veinti' + ones[num - 20];
    }
    if (num >= 30 && num < 100) {
      const ten = Math.floor(num / 10);
      const one = num % 10;
      return one === 0 ? tens[ten] : tens[ten] + ' y ' + ones[one];
    }
    
    return num.toString(); // Fallback para números mayores a 99
  }
}
