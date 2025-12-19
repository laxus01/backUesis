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
import { OperationCardRequestDto } from './dto/operation-card-request.dto';
import { ActiveContractDto } from './dto/active-contract.dto';

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
    let companyName = 'COOTRANSCAS'; // Default
    if (companyId) {
      const company = await this.companyService.findOne(companyId);
      if (company) {
        if (company.managerName) managerName = company.managerName.toUpperCase();
        if (company.managerPhone) managerPhone = company.managerPhone;
        if (company.name) companyName = company.name.toUpperCase();
      }
    }
    const doc = new PDFDocument({ margin: 70 });

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

    doc.moveDown(8);

    // Intro paragraph in bold
    if (existsSync(unicodeBoldFont)) {
      doc.font(unicodeBoldFont);
    } else {
      doc.font('Helvetica-Bold');
    }
    doc
      .fontSize(12)
      .text(
        sanitize(`EL SUSCRITO GERENTE Y REPRESENTANTE LEGAL DE ${companyName}`),
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
    
    const doc = new PDFDocument({ margin: 70 });

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

    doc.moveDown(8);

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
      sanitize(`${companyName} CERTIFICA QUE: El señor ${driverName} identificado con la cédula de ciudadanía No. ${driverIdentification} expedida en ${issuedIn}, ha laborado como conductor en vehículos tipo taxi afiliados a esta empresa, desde el ${dto.startDate} hasta ${dto.endDate}, destacándose por su responsabilidad, amabilidad, sencillez, honradez, trabajo en equipo, dominio de las normas de tránsito y sentido de pertenencia.`),
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

  async generateOwnerCertificate(ownerId: number, dto: OwnerCertificateDto, companyId: number | undefined, @Res() res: Response) {
    // Fetch data before starting PDF stream
    const owner = await this.ownerService.findOne(ownerId);
    if (!owner) throw new NotFoundException('Owner not found');

    if (!dto || typeof dto.amountNumber !== 'number' || !isFinite(dto.amountNumber) || !dto.amountWords) {
      throw new BadRequestException('amountNumber (number) and amountWords (string) are required');
    }

    if (!dto.vehicleIds || !Array.isArray(dto.vehicleIds) || dto.vehicleIds.length === 0) {
      throw new BadRequestException('vehicleIds (number[]) is required and must contain at least one id');
    }

    // Fetch all selected vehicles
    const vehicles = await this.vehiclesService.findByIds(dto.vehicleIds);
    if (!vehicles || vehicles.length === 0) {
      throw new NotFoundException('No vehicles found for the provided ids');
    }

    // Validate that all vehicles belong to the owner
    const invalidVehicle = vehicles.find(v => (v as any).owner?.id !== ownerId);
    if (invalidVehicle) {
      throw new BadRequestException('One or more vehicles do not belong to the specified owner');
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
    
    const doc = new PDFDocument({ margin: 70 });

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

    doc.moveDown(8);

    // Title
    if (existsSync(unicodeBoldFont)) {
      doc.font(unicodeBoldFont);
    } else {
      doc.font('Helvetica-Bold');
    }
    doc.fontSize(14).text('CERTIFICA QUE:', { align: 'center' });
    
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
      sanitize(` identificado(a) con la cédula de ciudadanía No. ${ownerIdentification} expedida en ${ownerIssuedIn}, es propietario ${vehicles.length > 1 ? 'de los siguientes vehículos' : 'del siguiente vehículo'} de servicio público tipo Taxi vinculados a esta empresa de transporte:`),
      { align: 'justify' }
    );

    doc.moveDown(2);

    // Draw table header for vehicles
    const tableTop = doc.y;
    const colPlate = 50;
    const colModel = 140;
    const colMake = 220;
    const colColor = 340;
    const colEntry = 430;

    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text('Placa', colPlate, tableTop);
    doc.text('Modelo', colModel, tableTop);
    doc.text('Marca', colMake, tableTop);
    doc.text('Color', colColor, tableTop);
    doc.text('Vinculación', colEntry, tableTop);

    doc.moveDown(1.2);

    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }

    // Table rows
    vehicles.forEach((vehicle) => {
      const rowY = doc.y;
      const vehicleMake = (vehicle as any).make?.name || 'N/A';
      const vehicleColor = (vehicle as any).color || 'amarillo';
      const entryDate = vehicle.entryDate
        ? new Date(vehicle.entryDate).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'N/A';

      doc.text(String(vehicle.plate || ''), colPlate, rowY);
      doc.text(String(vehicle.model || ''), colModel, rowY);
      doc.text(vehicleMake, colMake, rowY);
      doc.text(vehicleColor, colColor, rowY);
      doc.text(entryDate, colEntry, rowY);

      doc.moveDown(1.2);
    });

    doc.moveDown(2);

    // Income paragraph (reset X to left margin so it doesn't continue in the last table column)
    doc.fontSize(12);
    const incomeIntro = vehicles.length > 1
      ? 'Estos vehículos le representan a su propietario unos ingresos mensuales de: '
      : 'Este vehículo le representa a su propietario unos ingresos mensuales de: ';

    // 50 = left margin configured in PDFDocument({ margin: 50 })
    doc.text(
      sanitize(incomeIntro),
      50,
      doc.y,
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

    // Footer with date (ensure it also starts at left margin)
    const now = new Date();
    const day = now.getDate();
    const monthName = now.toLocaleDateString('es-CO', { month: 'long' });
    const year = now.getFullYear();
    doc
      .fontSize(12)
      .text(
        sanitize(`La presente certificación se expide a solicitud del interesado a los diez (${day}) días del mes de ${monthName} del ${year}.`),
        50,
        doc.y,
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

  async generateOperationCardRequest(vehicleId: number, companyId: number | undefined, @Res() res: Response) {
    // Fetch vehicle data
    const vehicle = await this.vehiclesService.findOne(vehicleId);
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    
    // Fetch owner data using the ownerId from vehicle
    const ownerId = (vehicle as any).owner?.id;
    if (!ownerId) throw new NotFoundException('Vehicle does not have an owner assigned');
    
    const owner = await this.ownerService.findOne(ownerId);
    if (!owner) throw new NotFoundException('Owner not found');
    
    // Get company data for manager info
    let managerName = 'CALIXTO E. TUÑON MARTINEZ'; // Default
    let managerTitle = 'Gerente'; // Default
    
    if (companyId === 2) {
      managerName = 'EDUARDO BELEÑO VILLANUEVA';
      managerTitle = 'JEFE DE TRANSPORTE';
    } else if (companyId) {
      const company = await this.companyService.findOne(companyId);
      if (company && company.managerName) {
        managerName = company.managerName.toUpperCase();
      }
    }
    
    const doc = new PDFDocument({ margin: 70 });

    // HTTP headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=solicitud_tarjeta_operacion.pdf');

    // Start piping
    doc.pipe(res);

    // Try to use a Unicode-capable font if available
    const unicodeFont = join(process.cwd(), 'assets', 'fonts', 'DejaVuSans.ttf');
    const unicodeBoldFont = join(process.cwd(), 'assets', 'fonts', 'DejaVuSans-Bold.ttf');
    if (existsSync(unicodeFont)) {
      doc.font(unicodeFont);
    } else {
      doc.font('Helvetica');
    }
    
    // Ensure text color is visible
    doc.opacity(1).fillColor('black');

    // Set metadata
    doc.info = {
      Title: 'Solicitud de Tarjeta de Operación',
      Author: 'Sistema UESIS',
      Subject: 'Solicitud de tarjeta de operación',
      Keywords: 'tarjeta, operación, vehículo',
      CreationDate: new Date(),
    } as any;

    const sanitize = (s: string) =>
      s
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'");

    // Space for company logo (pre-printed on paper)
    doc.moveDown(8);

    // Date and location
    const now = new Date();
    const day = now.getDate();
    const monthName = now.toLocaleDateString('es-CO', { month: 'long' });
    const year = now.getFullYear();
    
    doc.fontSize(11).text(sanitize(`Sincelejo, ${day} de ${monthName} de ${year}`), { align: 'left' });
    
    doc.moveDown(4);

    // Addressee
    doc.fontSize(11).text('Señores:', { align: 'left' });
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text('SECRETARIA DE MOVILIDAD DE SINCELEJO', { align: 'left' });
    doc.text('E.                    S.                    D.', { align: 'left' });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    
    doc.moveDown(3);

    // Reference
    doc.fontSize(11).text(sanitize('Referencia: '), { continued: true });
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text('Solicitud de tarjeta de operacion.');
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    
    doc.moveDown(3);

    // Main paragraph - aligned with document margin
    doc.fontSize(11).text(
      sanitize('Por medio de la presente, solicito a ustedes expedir tarjeta de operacion al vehiculo con las siguientes caracteristicas:'),
      { align: 'left' }
    );
    
    doc.moveDown(2);
    
    // Vehicle data in two columns
    const leftCol = 70; // Same as document margin
    const rightCol = 320;
    let currentY = doc.y;

    // Left column
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text('MARCA:', leftCol, currentY, { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text(`  ${(vehicle as any).make?.name || 'N/A'}`);
    
    // Right column - same Y position
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text('MODELO:', rightCol, currentY, { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text(`  ${vehicle.model || 'N/A'}`);
    
    doc.moveDown(0.8);
    currentY = doc.y;

    // Second row
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text('COLOR:', leftCol, currentY, { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text('  AMARILLO');
    
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text('TIPO:', rightCol, currentY, { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text('  HATCH BACK');
    
    doc.moveDown(0.8);
    currentY = doc.y;

    // Third row
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text('MOTOR:', leftCol, currentY, { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text(`  ${vehicle.engineNumber || 'N/A'}`);
    
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text('CHASIS:', rightCol, currentY, { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text(`  ${vehicle.chassisNumber || 'N/A'}`);
    
    doc.moveDown(0.8);
    currentY = doc.y;

    // Fourth row - PLACA solo en columna izquierda
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text('PLACA:', leftCol, currentY, { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text(`  ${vehicle.plate || 'N/A'}`);
    
    doc.moveDown(3);

    // Owner data
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text('PROPIETARIO:', leftCol, doc.y, { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text(`  ${owner.name.toUpperCase()}`);
    
    doc.moveDown(0.8);
    
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text('IDENTIFICACION:', leftCol, doc.y, { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text(`  ${owner.identification}`);
    
    doc.moveDown(3);

    // Closing
    doc.fontSize(11).text('Cordialmente,', { align: 'left' });
    
    doc.moveDown(5);

    // Signature block
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text(managerName, { align: 'left' });
    doc.text(managerTitle, { align: 'left' });
    
    // Restore normal font
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }

    // End document
    doc.end();
  }

  async generateActiveContract(vehicleId: number, companyId: number | undefined, @Res() res: Response) {
    // Fetch vehicle data
    const vehicle = await this.vehiclesService.findOne(vehicleId);
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    
    // Fetch owner data using the ownerId from vehicle
    const ownerId = (vehicle as any).owner?.id;
    if (!ownerId) throw new NotFoundException('Vehicle does not have an owner assigned');
    
    const owner = await this.ownerService.findOne(ownerId);
    if (!owner) throw new NotFoundException('Owner not found');
    
    // Get company data
    let companyName = '';
    let managerName = '';
    let managerTitle = 'Gerente';
    let introText = 'El suscrito gerente de la empresa';

    if (companyId) {
      const company = await this.companyService.findOne(companyId);
      if (company) {
        companyName = company.name?.toUpperCase() ?? '';
        managerName = company.managerName?.toUpperCase() ?? '';
      }
      
      // Custom overrides for specific companies
      if (companyId === 2) {
        managerName = 'EDUARDO BELEÑO VILLANUEVA';
        managerTitle = 'JEFE DE TRANSPORTE';
        introText = '';
      }
    }
    
    const doc = new PDFDocument({ margin: 70 });

    // HTTP headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=certificado_contrato_vigente.pdf');

    // Start piping
    doc.pipe(res);

    // Try to use a Unicode-capable font if available
    const unicodeFont = join(process.cwd(), 'assets', 'fonts', 'DejaVuSans.ttf');
    const unicodeBoldFont = join(process.cwd(), 'assets', 'fonts', 'DejaVuSans-Bold.ttf');
    if (existsSync(unicodeFont)) {
      doc.font(unicodeFont);
    } else {
      doc.font('Helvetica');
    }
    
    // Ensure text color is visible
    doc.opacity(1).fillColor('black');

    // Set metadata
    doc.info = {
      Title: 'Certificado de Contrato Vigente',
      Author: 'Sistema UESIS',
      Subject: 'Certificado de contrato vigente',
      Keywords: 'contrato, vigente, vehículo',
      CreationDate: new Date(),
    } as any;

    const sanitize = (s: string) =>
      s
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'");

    // Space for company logo (pre-printed on paper)
    doc.moveDown(8);

    // Title
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.fontSize(14).text('CERTIFICADO', { align: 'center' });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    
    doc.moveDown(2);

    // Main paragraph - aligned with document margin
    doc.fontSize(11).text(
      sanitize(`${introText} ${companyName}, certifica que el vehiculo cuyas caracteristicas se relacionan a continuacion, posee contrato vigente con la empresa:`),
      { align: 'left' }
    );
    
    doc.moveDown(2);
    
    // Vehicle data in two columns
    const leftCol = 70; // Same as document margin
    const rightCol = 320;
    let currentY = doc.y;

    // First row
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text('MARCA:', leftCol, currentY, { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text(` ${(vehicle as any).make?.name || 'N/A'}`);
    
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text('MODELO:', rightCol, currentY, { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text(`  ${vehicle.model || 'N/A'}`);
    
    doc.moveDown(0.8);
    currentY = doc.y;

    // Second row
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text('COLOR:', leftCol, currentY, { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text(' AMARILLO');
    
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text('TIPO:', rightCol, currentY, { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text('  HATCH BACK');
    
    doc.moveDown(0.8);
    currentY = doc.y;

    // Third row
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text('MOTOR:', leftCol, currentY, { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text(` ${vehicle.engineNumber || 'N/A'}`);
    
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text('CHASIS:', rightCol, currentY, { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text(`  ${vehicle.chassisNumber || 'N/A'}`);
    
    doc.moveDown(0.8);
    currentY = doc.y;

    // Fourth row - PLACA solo en columna izquierda
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text('PLACA:', leftCol, currentY, { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text(` ${vehicle.plate || 'N/A'}`);
    
    doc.moveDown(3);

    // Owner data
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text('PROPIETARIO:', leftCol, doc.y, { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text(`  ${owner.name.toUpperCase()}`);
    
    doc.moveDown(0.8);
    
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text('IDENTIFICACION:', leftCol, doc.y, { continued: true });
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }
    doc.text(`  ${owner.identification}`);
    
    doc.moveDown(2);

    // Date footer
    const now = new Date();
    const day = now.getDate();
    const monthName = now.toLocaleDateString('es-CO', { month: 'long' });
    const year = now.getFullYear();
    
    doc.fontSize(11).text(
      sanitize(`Para constacia se expide la presente certificacion el ${day} de ${monthName} de ${year}`),
      { align: 'justify' }
    );
    
    doc.moveDown(2);

    // Closing
    doc.fontSize(11).text('Cordialmente,', { align: 'left' });
    
    doc.moveDown(6);

    // Signature block
    if (existsSync(unicodeBoldFont)) { doc.font(unicodeBoldFont); } else { doc.font('Helvetica-Bold'); }
    doc.text(managerName, { align: 'left' });
    doc.text(managerTitle, { align: 'left' });
    
    // Restore normal font
    if (existsSync(unicodeFont)) { doc.font(unicodeFont); } else { doc.font('Helvetica'); }

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
