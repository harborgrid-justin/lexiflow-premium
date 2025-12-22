import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse }from '@nestjs/swagger';
import { FeeAgreementsService } from './fee-agreements.service';
import { CreateFeeAgreementDto } from './dto/create-fee-agreement.dto';
import { UpdateFeeAgreementDto } from './dto/update-fee-agreement.dto';
import { FeeAgreement, FeeAgreementStatus } from './entities/fee-agreement.entity';

@ApiTags('Billing - Fee Agreements')
@ApiBearerAuth('JWT-auth')

@Controller('billing/fee-agreements')
export class FeeAgreementsController {
  constructor(private readonly feeAgreementsService: FeeAgreementsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() createFeeAgreementDto: CreateFeeAgreementDto): Promise<FeeAgreement> {
    return await this.feeAgreementsService.create(createFeeAgreementDto);
  }

  @Get()
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Query('clientId') clientId?: string,
    @Query('caseId') caseId?: string,
    @Query('status') status?: FeeAgreementStatus,
  ): Promise<FeeAgreement[]> {
    return await this.feeAgreementsService.findAll(clientId, caseId, status);
  }

  @Get('case/:caseId')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findByCase(@Param('caseId') caseId: string): Promise<FeeAgreement | null> {
    return await this.feeAgreementsService.findByCase(caseId);
  }

  @Get('client/:clientId')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findByClient(@Param('clientId') clientId: string): Promise<FeeAgreement[]> {
    return await this.feeAgreementsService.findByClient(clientId);
  }

  @Get(':id')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string): Promise<FeeAgreement> {
    return await this.feeAgreementsService.findOne(id);
  }

  @Put(':id')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(
    @Param('id') id: string,
    @Body() updateFeeAgreementDto: UpdateFeeAgreementDto,
  ): Promise<FeeAgreement> {
    return await this.feeAgreementsService.update(id, updateFeeAgreementDto);
  }

  @Put(':id/activate')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async activate(@Param('id') id: string): Promise<FeeAgreement> {
    return await this.feeAgreementsService.activate(id);
  }

  @Put(':id/suspend')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async suspend(@Param('id') id: string): Promise<FeeAgreement> {
    return await this.feeAgreementsService.suspend(id);
  }

  @Put(':id/terminate')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async terminate(
    @Param('id') id: string,
    @Body('terminationDate') terminationDate?: string,
  ): Promise<FeeAgreement> {
    return await this.feeAgreementsService.terminate(id, terminationDate);
  }

  @Put(':id/sign')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async sign(@Param('id') id: string, @Body('signedBy') signedBy: string): Promise<FeeAgreement> {
    return await this.feeAgreementsService.sign(id, signedBy);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.feeAgreementsService.remove(id);
  }
}

