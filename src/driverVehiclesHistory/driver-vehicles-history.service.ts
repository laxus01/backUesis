import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { DriverVehicleHistory } from './entities/driver-vehicle-history.entity';
import { QueryDriverVehicleHistoryDto } from './dto/query-driver-vehicle-history.dto';
import { DriverVehicle } from '../driverVehicles/entities/driver-vehicle.entity';

@Injectable()
export class DriverVehiclesHistoryService {
  constructor(
    @InjectRepository(DriverVehicleHistory) private historyRepo: Repository<DriverVehicleHistory>,
  ) { }

  async saveToHistory(original: DriverVehicle, actionType: string, changedBy?: string) {
    const historyRecord = this.historyRepo.create({
      driver: original.driver,
      vehicle: original.vehicle,
      originalRecordId: original.id,
      permitExpiresOn: original.permitExpiresOn,
      note: original.note,
      soat: original.soat,
      soatExpires: original.soatExpires,
      operationCard: original.operationCard,
      operationCardExpires: original.operationCardExpires,
      contractualExpires: original.contractualExpires,
      extraContractualExpires: original.extraContractualExpires,
      technicalMechanicExpires: original.technicalMechanicExpires,
      originalCreatedAt: original.createdAt,
      originalUpdatedAt: original.updatedAt,
      actionType,
      changedBy
    });

    await this.historyRepo.save(historyRecord);
  }

  async findHistory(query: QueryDriverVehicleHistoryDto, companyId?: number) {
    const queryBuilder = this.historyRepo.createQueryBuilder('history')
      .leftJoinAndSelect('history.driver', 'driver')
      .leftJoinAndSelect('history.vehicle', 'vehicle')
      .leftJoinAndSelect('vehicle.company', 'company')
      .leftJoinAndSelect('vehicle.owner', 'owner');

    if (companyId) {
      queryBuilder.andWhere('company.id = :companyId', { companyId });
    }

    if (query.driverId) {
      queryBuilder.andWhere('driver.id = :driverId', { driverId: query.driverId });
    }

    if (query.vehicleId) {
      queryBuilder.andWhere('vehicle.id = :vehicleId', { vehicleId: query.vehicleId });
    }

    if (query.originalRecordId) {
      queryBuilder.andWhere('history.originalRecordId = :originalRecordId', { originalRecordId: query.originalRecordId });
    }

    if (query.actionType) {
      queryBuilder.andWhere('history.actionType = :actionType', { actionType: query.actionType });
    }

    if (query.changedBy) {
      queryBuilder.andWhere('history.changedBy LIKE :changedBy', { changedBy: `%${query.changedBy}%` });
    }

    const rangeStart = query.startDate || query.fromDate;
    const rangeEnd = query.endDate || query.toDate;

    // Si se especifica un campo de vencimiento y rango de fechas, filtrar por ese campo
    if (query.fieldName && rangeStart && rangeEnd) {
      const allowedFields = [
        'permit_expires_on',
        'soat_expires_on',
        'operation_card_expires_on',
        'contractual_expires_on',
        'extra_contractual_expires_on',
        'technical_mechanic_expires_on',
        'expires_on',
        'all_documents',
      ];

      if (!allowedFields.includes(query.fieldName)) {
        // Si el fieldName no es válido, no aplicamos filtro por vencimiento y caemos al filtro por historyCreatedAt
      } else if (query.fieldName === 'all_documents') {
        queryBuilder.andWhere(
          '(' +
          '(DATE(history.permitExpiresOn) BETWEEN :rangeStart AND :rangeEnd) OR ' +
          '(DATE(history.soatExpires) BETWEEN :rangeStart AND :rangeEnd) OR ' +
          '(DATE(history.operationCardExpires) BETWEEN :rangeStart AND :rangeEnd) OR ' +
          '(DATE(history.contractualExpires) BETWEEN :rangeStart AND :rangeEnd) OR ' +
          '(DATE(history.extraContractualExpires) BETWEEN :rangeStart AND :rangeEnd) OR ' +
          '(DATE(history.technicalMechanicExpires) BETWEEN :rangeStart AND :rangeEnd)' +
          ')',
          { rangeStart, rangeEnd },
        );
      } else if (query.fieldName === 'expires_on') {
        // Filtrar por fecha de vencimiento de licencia del conductor
        queryBuilder.andWhere(
          'DATE(driver.expiresOn) BETWEEN :rangeStart AND :rangeEnd',
          { rangeStart, rangeEnd },
        );
      } else {
        let columnName: string;
        switch (query.fieldName) {
          case 'permit_expires_on':
            columnName = 'permitExpiresOn';
            break;
          case 'soat_expires_on':
            columnName = 'soatExpires';
            break;
          case 'operation_card_expires_on':
            columnName = 'operationCardExpires';
            break;
          case 'contractual_expires_on':
            columnName = 'contractualExpires';
            break;
          case 'extra_contractual_expires_on':
            columnName = 'extraContractualExpires';
            break;
          case 'technical_mechanic_expires_on':
            columnName = 'technicalMechanicExpires';
            break;
          default:
            columnName = query.fieldName;
        }

        queryBuilder.andWhere(
          `DATE(history.${columnName}) BETWEEN :rangeStart AND :rangeEnd`,
          { rangeStart, rangeEnd },
        );
      }
    } else {
      // Comportamiento anterior: filtrar por fecha de creación del historial
      if (query.fromDate) {
        queryBuilder.andWhere('DATE(history.historyCreatedAt) >= :fromDate', { fromDate: query.fromDate });
      }

      if (query.toDate) {
        queryBuilder.andWhere('DATE(history.historyCreatedAt) <= :toDate', { toDate: query.toDate });
      }
    }

    // Subconsulta para obtener el MAX(id) por cada originalRecordId
    const subQuery = this.historyRepo.createQueryBuilder('sub')
      .select('MAX(sub.id)', 'maxId')
      .groupBy('sub.originalRecordId');

    // Aplicar los mismos filtros en la subconsulta si existen
    if (companyId) {
      subQuery
        .leftJoin('sub.vehicle', 'subVehicle')
        .leftJoin('subVehicle.company', 'subCompany')
        .andWhere('subCompany.id = :companyId', { companyId });
    }

    if (query.driverId) {
      subQuery
        .leftJoin('sub.driver', 'subDriver')
        .andWhere('subDriver.id = :driverId', { driverId: query.driverId });
    }

    if (query.vehicleId) {
      if (!companyId) {
        subQuery.leftJoin('sub.vehicle', 'subVehicle');
      }
      subQuery.andWhere('subVehicle.id = :vehicleId', { vehicleId: query.vehicleId });
    }

    if (query.originalRecordId) {
      subQuery.andWhere('sub.originalRecordId = :originalRecordId', { originalRecordId: query.originalRecordId });
    }

    if (query.actionType) {
      subQuery.andWhere('sub.actionType = :actionType', { actionType: query.actionType });
    }

    if (query.changedBy) {
      subQuery.andWhere('sub.changedBy LIKE :changedBy', { changedBy: `%${query.changedBy}%` });
    }

    if (query.fromDate) {
      // Filtrar por día también en la subconsulta
      subQuery.andWhere('DATE(sub.historyCreatedAt) >= :fromDate', { fromDate: query.fromDate });
    }

    if (query.toDate) {
      // Filtrar por día también en la subconsulta
      subQuery.andWhere('DATE(sub.historyCreatedAt) <= :toDate', { toDate: query.toDate });
    }

    // Filtrar la consulta principal usando la subconsulta
    return queryBuilder
      .andWhere(`history.id IN (${subQuery.getQuery()})`)
      .setParameters(subQuery.getParameters())
      .orderBy('history.historyCreatedAt', 'DESC')
      .getMany();
  }

  async generateExcelReport(query: QueryDriverVehicleHistoryDto, companyId?: number): Promise<Buffer> {
    // Obtener los datos del historial con los mismos filtros que findHistory
    const historyRecords = await this.findHistory(query, companyId);

    // Crear un nuevo libro de trabajo
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Historial Conductor-Vehículo');

    // Configurar columnas dinámicamente según el campo de vencimiento solicitado
    const baseColumns: Partial<ExcelJS.Column>[] = [
      { header: 'Conductor', key: 'driverName', width: 30 },
      { header: 'Identificación', key: 'driverIdentification', width: 15 },
      { header: 'Placa', key: 'vehiclePlate', width: 15 },
      { header: 'Propietario', key: 'ownerName', width: 30 },
      { header: 'Teléfono Propietario', key: 'ownerPhone', width: 18 },
    ];

    const expirationColumnMap: Record<string, Partial<ExcelJS.Column>> = {
      expires_on: { header: 'Licencia Expira', key: 'licenseExpires', width: 18 },
      permit_expires_on: { header: 'Permiso Expira', key: 'permitExpiresOn', width: 15 },
      soat_expires_on: { header: 'SOAT Expira', key: 'soatExpires', width: 15 },
      operation_card_expires_on: { header: 'T. Operación Expira', key: 'operationCardExpires', width: 18 },
      contractual_expires_on: { header: 'Contractual Expira', key: 'contractualExpires', width: 18 },
      extra_contractual_expires_on: { header: 'Extra Contractual Expira', key: 'extraContractualExpires', width: 22 },
      technical_mechanic_expires_on: { header: 'Técnico Mecánica Expira', key: 'technicalMechanicExpires', width: 22 },
    };

    const fieldName = (query as any).fieldName as string | undefined;

    let expirationColumns: Partial<ExcelJS.Column>[];
    if (!fieldName || fieldName === 'all_documents') {
      // Incluir todas las columnas de vencimiento
      expirationColumns = Object.values(expirationColumnMap);
    } else {
      const col = expirationColumnMap[fieldName];
      // Si el fieldName no es reconocido, por seguridad incluimos todas
      expirationColumns = col ? [col] : Object.values(expirationColumnMap);
    }

    worksheet.columns = [...baseColumns, ...expirationColumns] as ExcelJS.Column[];

    // Estilizar el encabezado
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '366092' },
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // Agregar los datos
    historyRecords.forEach((record, index) => {
      const driverFullName = record.driver 
        ? `${record.driver.firstName} ${record.driver.lastName}`.trim() 
        : 'N/A';
      
      const row = worksheet.addRow({
        driverName: driverFullName,
        driverIdentification: record.driver?.identification || 'N/A',
        vehiclePlate: record.vehicle?.plate || 'N/A',
        ownerName: record.vehicle?.owner?.name || 'N/A',
        ownerPhone: record.vehicle?.owner?.phone || 'N/A',
        licenseExpires: record.driver?.expiresOn || 'N/A',
        permitExpiresOn: record.permitExpiresOn || 'N/A',
        soat: record.soat || 'N/A',
        soatExpires: record.soatExpires || 'N/A',
        operationCard: record.operationCard || 'N/A',
        operationCardExpires: record.operationCardExpires || 'N/A',
        contractualExpires: record.contractualExpires || 'N/A',
        extraContractualExpires: record.extraContractualExpires || 'N/A',
        technicalMechanicExpires: record.technicalMechanicExpires || 'N/A',
      });

      // Alternar colores de fila para mejor legibilidad
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F8F9FA' },
        };
      }
    });

    // Agregar bordes a todas las celdas
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Agregar información adicional al final
    const lastRow = worksheet.lastRow.number + 2;
    worksheet.getCell(`A${lastRow}`).value = `Total de registros: ${historyRecords.length}`;
    worksheet.getCell(`A${lastRow}`).font = { bold: true };
    
    const dateRow = lastRow + 1;
    worksheet.getCell(`A${dateRow}`).value = `Fecha de generación: ${new Date().toLocaleString('es-ES')}`;
    worksheet.getCell(`A${dateRow}`).font = { italic: true };

    // Agregar información de filtros aplicados si existen
    if (query.fromDate || query.toDate) {
      const filterRow = lastRow + 2;
      const filterText = `Rango de fechas: ${query.fromDate || 'Inicio'} - ${query.toDate || 'Fin'}`;
      worksheet.getCell(`A${filterRow}`).value = filterText;
      worksheet.getCell(`A${filterRow}`).font = { italic: true };
    }

    // Generar el buffer del archivo Excel
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
