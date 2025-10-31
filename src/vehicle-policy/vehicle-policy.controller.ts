import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { VehiclePolicyService } from './vehicle-policy.service';
import { CreateVehiclePolicyDto } from './dto/create-vehicle-policy.dto';
import { UpdateVehiclePolicyDto } from './dto/update-vehicle-policy.dto';
import { QueryVehiclePolicyDto } from './dto/query-vehicle-policy.dto';

@Controller('vehicle-policies')
export class VehiclePolicyController {
  constructor(private readonly vehiclePolicyService: VehiclePolicyService) {}

  /**
   * POST /vehicle-policies
   * Crear una nueva asignación de póliza a vehículo
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createDto: CreateVehiclePolicyDto,
    @Headers('companyId') companyId?: string,
  ) {
    return this.vehiclePolicyService.create(
      createDto,
      companyId ? Number(companyId) : undefined,
    );
  }

  /**
   * GET /vehicle-policies
   * Obtener todas las asignaciones con filtros opcionales
   */
  @Get()
  findAll(
    @Query() query: QueryVehiclePolicyDto,
    @Headers('companyId') companyId?: string,
  ) {
    return this.vehiclePolicyService.findAll(
      query,
      companyId ? Number(companyId) : undefined,
    );
  }

  /**
   * GET /vehicle-policies/:id
   * Obtener una asignación por ID
   */
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('companyId') companyId?: string,
  ) {
    return this.vehiclePolicyService.findOne(
      Number(id),
      companyId ? Number(companyId) : undefined,
    );
  }

  /**
   * GET /vehicle-policies/vehicle/:vehicleId/active
   * Obtener la póliza activa de un vehículo
   */
  @Get('vehicle/:vehicleId/active')
  findActiveByVehicle(
    @Param('vehicleId') vehicleId: string,
    @Headers('companyId') companyId?: string,
  ) {
    return this.vehiclePolicyService.findActiveByVehicle(
      Number(vehicleId),
      companyId ? Number(companyId) : undefined,
    );
  }

  /**
   * PATCH /vehicle-policies/:id
   * Actualizar una asignación
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateVehiclePolicyDto,
    @Headers('companyId') companyId?: string,
  ) {
    return this.vehiclePolicyService.update(
      Number(id),
      updateDto,
      companyId ? Number(companyId) : undefined,
    );
  }

  /**
   * PATCH /vehicle-policies/:id/deactivate
   * Desactivar una asignación
   */
  @Patch(':id/deactivate')
  deactivate(
    @Param('id') id: string,
    @Headers('companyId') companyId?: string,
  ) {
    return this.vehiclePolicyService.deactivate(
      Number(id),
      companyId ? Number(companyId) : undefined,
    );
  }

  /**
   * PATCH /vehicle-policies/:id/activate
   * Activar una asignación
   */
  @Patch(':id/activate')
  activate(
    @Param('id') id: string,
    @Headers('companyId') companyId?: string,
  ) {
    return this.vehiclePolicyService.activate(
      Number(id),
      companyId ? Number(companyId) : undefined,
    );
  }

  /**
   * DELETE /vehicle-policies/:id
   * Eliminar una asignación
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id') id: string,
    @Headers('companyId') companyId?: string,
  ) {
    return this.vehiclePolicyService.remove(
      Number(id),
      companyId ? Number(companyId) : undefined,
    );
  }
}
