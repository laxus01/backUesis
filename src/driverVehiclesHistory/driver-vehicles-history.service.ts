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
      .leftJoinAndSelect('vehicle.company', 'company');

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

    if (query.fromDate) {
      // Filtrar por día, ignorando la hora
      queryBuilder.andWhere('DATE(history.historyCreatedAt) >= :fromDate', { fromDate: query.fromDate });
    }

    if (query.toDate) {
      // Filtrar por día, ignorando la hora
      queryBuilder.andWhere('DATE(history.historyCreatedAt) <= :toDate', { toDate: query.toDate });
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

    // Configurar las columnas
    worksheet.columns = [
      { header: 'Conductor', key: 'driverName', width: 30 },
      { header: 'Identificación', key: 'driverIdentification', width: 15 },
      { header: 'Vehículo (Placa)', key: 'vehiclePlate', width: 15 },
      { header: 'Empresa', key: 'company', width: 25 },
      { header: 'Permiso Expira', key: 'permitExpiresOn', width: 15 },
      { header: 'SOAT', key: 'soat', width: 20 },
      { header: 'SOAT Expira', key: 'soatExpires', width: 15 },
      { header: 'Tarjeta Operación', key: 'operationCard', width: 20 },
      { header: 'T. Operación Expira', key: 'operationCardExpires', width: 18 },
      { header: 'Contractual Expira', key: 'contractualExpires', width: 18 },
      { header: 'Extra Contractual Expira', key: 'extraContractualExpires', width: 22 },
      { header: 'Técnico Mecánica Expira', key: 'technicalMechanicExpires', width: 22 },
    ];

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
        company: record.vehicle?.company?.name || 'N/A',
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
