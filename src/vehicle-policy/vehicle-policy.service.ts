import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehiclePolicy } from './entities/vehicle-policy.entity';
import { CreateVehiclePolicyDto } from './dto/create-vehicle-policy.dto';
import { UpdateVehiclePolicyDto } from './dto/update-vehicle-policy.dto';
import { QueryVehiclePolicyDto } from './dto/query-vehicle-policy.dto';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Policy } from '../policy/entities/policy.entity';

@Injectable()
export class VehiclePolicyService {
  constructor(
    @InjectRepository(VehiclePolicy)
    private vehiclePolicyRepository: Repository<VehiclePolicy>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Policy)
    private policyRepository: Repository<Policy>,
  ) {}

  /**
   * Crear una nueva asignación de póliza a vehículo
   */
  async create(data: CreateVehiclePolicyDto, companyId?: number): Promise<VehiclePolicy> {
    // Validar que el vehículo existe
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: data.vehicleId },
      relations: ['company'],
    });

    if (!vehicle) {
      throw new HttpException({
        message: 'Vehículo no encontrado',
        error: 'VEHICLE_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
        vehicleId: data.vehicleId,
      }, HttpStatus.NOT_FOUND);
    }

    // Si se proporciona companyId, validar que el vehículo pertenece a esa compañía
    if (companyId && vehicle.company?.id !== companyId) {
      throw new HttpException({
        message: 'El vehículo no pertenece a la compañía especificada',
        error: 'VEHICLE_NOT_IN_COMPANY',
        statusCode: HttpStatus.FORBIDDEN,
        vehicleId: data.vehicleId,
        companyId,
      }, HttpStatus.FORBIDDEN);
    }

    // Validar que la póliza existe
    const policy = await this.policyRepository.findOne({
      where: { id: data.policyId },
      relations: ['company'],
    });

    if (!policy) {
      throw new HttpException({
        message: 'Póliza no encontrada',
        error: 'POLICY_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
        policyId: data.policyId,
      }, HttpStatus.NOT_FOUND);
    }

    // Validar que la póliza pertenece a la misma compañía que el vehículo
    if (vehicle.company?.id !== policy.company?.id) {
      throw new HttpException({
        message: 'La póliza no pertenece a la misma compañía que el vehículo',
        error: 'POLICY_COMPANY_MISMATCH',
        statusCode: HttpStatus.BAD_REQUEST,
        vehicleCompanyId: vehicle.company?.id,
        policyCompanyId: policy.company?.id,
      }, HttpStatus.BAD_REQUEST);
    }

    // Verificar si ya existe una asignación activa para este vehículo
    const existingActive = await this.vehiclePolicyRepository.findOne({
      where: {
        vehicleId: data.vehicleId,
        state: 1,
      },
    });

    // Si existe una póliza activa, desactivarla automáticamente
    if (existingActive) {
      existingActive.state = 0;
      await this.vehiclePolicyRepository.save(existingActive);
    }

    // Crear la nueva asignación activa
    const vehiclePolicy = this.vehiclePolicyRepository.create({
      vehicleId: data.vehicleId,
      policyId: data.policyId,
      createdBy: data.createdBy,
      state: 1,
    });

    try {
      const saved = await this.vehiclePolicyRepository.save(vehiclePolicy);
      return this.findOne(saved.id);
    } catch (error) {
      throw new HttpException({
        message: 'Error al crear la asignación de póliza',
        error: 'CREATE_ERROR',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Obtener todas las asignaciones con filtros opcionales
   */
  async findAll(query: QueryVehiclePolicyDto, companyId?: number): Promise<VehiclePolicy[]> {
    const where: any = { state: 1 };

    if (query.vehicleId) {
      where.vehicleId = query.vehicleId;
    }

    if (query.policyId) {
      where.policyId = query.policyId;
    }

    // Si se proporciona companyId, filtrar por vehículos de esa compañía
    if (companyId) {
      where.vehicle = { company: { id: companyId } };
    }

    return this.vehiclePolicyRepository.find({
      where,
      relations: ['vehicle', 'vehicle.company', 'vehicle.make', 'policy', 'policy.insurer', 'policy.company', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener una asignación por ID
   */
  async findOne(id: number, companyId?: number): Promise<VehiclePolicy> {
    const where: any = { id };

    if (companyId) {
      where.vehicle = { company: { id: companyId } };
    }

    const vehiclePolicy = await this.vehiclePolicyRepository.findOne({
      where,
      relations: ['vehicle', 'vehicle.company', 'vehicle.make', 'policy', 'policy.insurer', 'policy.company', 'user'],
    });

    if (!vehiclePolicy) {
      throw new HttpException({
        message: 'Asignación de póliza no encontrada',
        error: 'VEHICLE_POLICY_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
        id,
      }, HttpStatus.NOT_FOUND);
    }

    return vehiclePolicy;
  }

  /**
   * Obtener la póliza activa de un vehículo
   */
  async findActiveByVehicle(vehicleId: number, companyId?: number): Promise<VehiclePolicy | null> {
    const where: any = {
      vehicleId,
      state: 1,
    };

    if (companyId) {
      where.vehicle = { company: { id: companyId } };
    }

    return this.vehiclePolicyRepository.findOne({
      where,
      relations: ['vehicle', 'vehicle.company', 'policy', 'policy.insurer', 'policy.company', 'user'],
    });
  }

  /**
   * Actualizar una asignación
   */
  async update(id: number, data: UpdateVehiclePolicyDto, companyId?: number): Promise<VehiclePolicy> {
    const existing = await this.findOne(id, companyId);

    // Si se actualiza el vehicleId, validar el nuevo vehículo
    if (data.vehicleId && data.vehicleId !== existing.vehicleId) {
      const vehicle = await this.vehicleRepository.findOne({
        where: { id: data.vehicleId },
        relations: ['company'],
      });

      if (!vehicle) {
        throw new HttpException({
          message: 'Vehículo no encontrado',
          error: 'VEHICLE_NOT_FOUND',
          statusCode: HttpStatus.NOT_FOUND,
          vehicleId: data.vehicleId,
        }, HttpStatus.NOT_FOUND);
      }

      if (companyId && vehicle.company?.id !== companyId) {
        throw new HttpException({
          message: 'El vehículo no pertenece a la compañía especificada',
          error: 'VEHICLE_NOT_IN_COMPANY',
          statusCode: HttpStatus.FORBIDDEN,
        }, HttpStatus.FORBIDDEN);
      }
    }

    // Si se actualiza el policyId, validar la nueva póliza
    if (data.policyId && data.policyId !== existing.policyId) {
      const policy = await this.policyRepository.findOne({
        where: { id: data.policyId },
      });

      if (!policy) {
        throw new HttpException({
          message: 'Póliza no encontrada',
          error: 'POLICY_NOT_FOUND',
          statusCode: HttpStatus.NOT_FOUND,
          policyId: data.policyId,
        }, HttpStatus.NOT_FOUND);
      }
    }

    // Actualizar campos
    const updated = this.vehiclePolicyRepository.merge(existing, {
      vehicleId: data.vehicleId,
      policyId: data.policyId,
    });

    try {
      await this.vehiclePolicyRepository.save(updated);
      return this.findOne(id, companyId);
    } catch (error) {
      throw new HttpException({
        message: 'Error al actualizar la asignación de póliza',
        error: 'UPDATE_ERROR',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Desactivar una asignación (cambiar state a 0)
   */
  async deactivate(id: number, companyId?: number): Promise<{ message: string; vehiclePolicy: VehiclePolicy }> {
    const existing = await this.findOne(id, companyId);

    if (existing.state === 0) {
      throw new HttpException({
        message: 'La asignación ya está desactivada',
        error: 'ALREADY_DEACTIVATED',
        statusCode: HttpStatus.BAD_REQUEST,
      }, HttpStatus.BAD_REQUEST);
    }

    existing.state = 0;
    await this.vehiclePolicyRepository.save(existing);

    return {
      message: 'Asignación de póliza desactivada exitosamente',
      vehiclePolicy: await this.findOne(id, companyId),
    };
  }

  /**
   * Activar una asignación (cambiar state a 1)
   */
  async activate(id: number, companyId?: number): Promise<{ message: string; vehiclePolicy: VehiclePolicy }> {
    const existing = await this.findOne(id, companyId);

    if (existing.state === 1) {
      throw new HttpException({
        message: 'La asignación ya está activa',
        error: 'ALREADY_ACTIVE',
        statusCode: HttpStatus.BAD_REQUEST,
      }, HttpStatus.BAD_REQUEST);
    }

    // Verificar que no haya otra asignación activa para el mismo vehículo
    const otherActive = await this.vehiclePolicyRepository.findOne({
      where: {
        vehicleId: existing.vehicleId,
        state: 1,
      },
    });

    if (otherActive) {
      throw new HttpException({
        message: 'El vehículo ya tiene otra póliza activa asignada',
        error: 'VEHICLE_HAS_ACTIVE_POLICY',
        statusCode: HttpStatus.CONFLICT,
        existingPolicyId: otherActive.policyId,
      }, HttpStatus.CONFLICT);
    }

    existing.state = 1;
    await this.vehiclePolicyRepository.save(existing);

    return {
      message: 'Asignación de póliza activada exitosamente',
      vehiclePolicy: await this.findOne(id, companyId),
    };
  }

  /**
   * Eliminar una asignación
   */
  async remove(id: number, companyId?: number): Promise<{ message: string; deletedId: number }> {
    const existing = await this.findOne(id, companyId);

    try {
      await this.vehiclePolicyRepository.remove(existing);
      return {
        message: 'Asignación de póliza eliminada exitosamente',
        deletedId: id,
      };
    } catch (error) {
      throw new HttpException({
        message: 'Error al eliminar la asignación de póliza',
        error: 'DELETE_ERROR',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
