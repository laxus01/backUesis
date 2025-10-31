import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Policy } from './entities/policy.entity';
import { Insurer } from '../insurer/entities/insurer.entity';
import { Company } from '../company/entities/company.entity';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';

@Injectable()
export class PolicyService {
  constructor(
    @InjectRepository(Policy) private policyRepo: Repository<Policy>,
    @InjectRepository(Insurer) private insurerRepo: Repository<Insurer>,
    @InjectRepository(Company) private companyRepo: Repository<Company>,
  ) {}

  /**
   * Obtener todas las pólizas
   * @param insurerId - Filtrar por ID de aseguradora (opcional)
   * @param companyId - Filtrar por ID de compañía (opcional)
   */
  async findAll(insurerId?: number, companyId?: number) {
    const where: any = {};
    
    if (companyId) {
      where.companyId = companyId;
    }
    
    if (insurerId) {
      where.insurerId = insurerId;
    }
    
    return this.policyRepo.find({ 
      where,
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Obtener una póliza por ID
   */
  async findOne(id: number) {
    const policy = await this.policyRepo.findOne({ where: { id } });
    if (!policy) {
      throw new HttpException(
        {
          message: 'Póliza no encontrada',
          error: 'POLICY_NOT_FOUND',
          statusCode: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return policy;
  }

  /**
   * Crear una nueva póliza
   */
  async create(data: CreatePolicyDto) {
    // Validar que la compañía existe
    const company = await this.companyRepo.findOne({ 
      where: { id: data.companyId } 
    });
    
    if (!company) {
      throw new HttpException(
        {
          message: 'La compañía especificada no existe',
          error: 'COMPANY_NOT_FOUND',
          statusCode: HttpStatus.NOT_FOUND,
          companyId: data.companyId,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Validar que la aseguradora existe
    const insurer = await this.insurerRepo.findOne({ 
      where: { id: data.insurerId } 
    });
    
    if (!insurer) {
      throw new HttpException(
        {
          message: 'La aseguradora especificada no existe',
          error: 'INSURER_NOT_FOUND',
          statusCode: HttpStatus.NOT_FOUND,
          insurerId: data.insurerId,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      // Desactivar todas las pólizas activas (state=1) de esta compañía
      await this.policyRepo.update(
        { companyId: data.companyId, state: 1 },
        { state: 0 }
      );

      // Crear la nueva póliza con state=1 (activa)
      const policy = this.policyRepo.create({ ...data, state: 1 });
      const savedPolicy = await this.policyRepo.save(policy);
      
      return {
        message: 'Póliza creada exitosamente',
        policy: savedPolicy,
      };
    } catch (error: any) {
      throw new HttpException(
        {
          message: 'Error al crear la póliza',
          error: 'CREATE_POLICY_ERROR',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Actualizar una póliza existente
   */
  async update(id: number, data: UpdatePolicyDto) {
    const policy = await this.findOne(id);

    // Si se está actualizando el insurerId, validar que existe
    if (data.insurerId && data.insurerId !== policy.insurerId) {
      const insurer = await this.insurerRepo.findOne({ 
        where: { id: data.insurerId } 
      });
      
      if (!insurer) {
        throw new HttpException(
          {
            message: 'La aseguradora especificada no existe',
            error: 'INSURER_NOT_FOUND',
            statusCode: HttpStatus.NOT_FOUND,
            insurerId: data.insurerId,
          },
          HttpStatus.NOT_FOUND,
        );
      }
    }

    try {
      Object.assign(policy, data);
      const updatedPolicy = await this.policyRepo.save(policy);
      
      return {
        message: 'Póliza actualizada exitosamente',
        policy: updatedPolicy,
      };
    } catch (error: any) {
      throw new HttpException(
        {
          message: 'Error al actualizar la póliza',
          error: 'UPDATE_POLICY_ERROR',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Eliminar una póliza
   */
  async remove(id: number) {
    const policy = await this.findOne(id);

    try {
      await this.policyRepo.remove(policy);
      
      return {
        message: 'Póliza eliminada exitosamente',
        policy: {
          id: policy.id,
          insurerId: policy.insurerId,
          insurerName: policy.insurer?.name,
          contractual: policy.contractual,
          extraContractual: policy.extraContractual,
        },
      };
    } catch (error: any) {
      throw new HttpException(
        {
          message: 'Error al eliminar la póliza',
          error: 'DELETE_POLICY_ERROR',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtener todas las pólizas de una aseguradora específica
   */
  async findByInsurer(insurerId: number) {
    const insurer = await this.insurerRepo.findOne({ 
      where: { id: insurerId } 
    });
    
    if (!insurer) {
      throw new HttpException(
        {
          message: 'La aseguradora especificada no existe',
          error: 'INSURER_NOT_FOUND',
          statusCode: HttpStatus.NOT_FOUND,
          insurerId,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const policies = await this.policyRepo.find({
      where: { insurerId },
      order: { createdAt: 'DESC' },
    });

    return {
      insurerId,
      insurerName: insurer.name,
      totalPolicies: policies.length,
      policies,
    };
  }
}
