import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  Headers,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { PolicyService } from './policy.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';

@Controller('policies')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  /**
   * GET /policies
   * Obtener todas las pólizas (con filtro opcional por insurerId)
   */
  @Get()
  findAll(
    @Query('insurerId') insurerId?: string,
    @Headers('companyId') companyId?: string,
  ) {
    const parsedInsurerId = insurerId ? parseInt(insurerId, 10) : undefined;
    const parsedCompanyId = companyId ? parseInt(companyId, 10) : undefined;
    return this.policyService.findAll(parsedInsurerId, parsedCompanyId);
  }

  /**
   * GET /policies/:id
   * Obtener una póliza por ID
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.policyService.findOne(id);
  }

  /**
   * GET /policies/insurer/:insurerId
   * Obtener todas las pólizas de una aseguradora específica
   */
  @Get('insurer/:insurerId')
  findByInsurer(@Param('insurerId', ParseIntPipe) insurerId: number) {
    return this.policyService.findByInsurer(insurerId);
  }

  /**
   * POST /policies
   * Crear una nueva póliza
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createPolicyDto: CreatePolicyDto,
    @Headers('companyId') companyId?: string,
  ) {
    // Validar que el header companyId esté presente
    if (!companyId) {
      throw new HttpException(
        {
          message: 'El header companyId es requerido',
          error: 'COMPANY_ID_HEADER_REQUIRED',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Asignar companyId desde el header al DTO
    createPolicyDto.companyId = parseInt(companyId, 10);
    return this.policyService.create(createPolicyDto);
  }

  /**
   * PATCH /policies/:id
   * Actualizar una póliza existente
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePolicyDto: UpdatePolicyDto,
  ) {
    return this.policyService.update(id, updatePolicyDto);
  }

  /**
   * DELETE /policies/:id
   * Eliminar una póliza
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.policyService.remove(id);
  }
}
