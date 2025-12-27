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
  UseGuards,
  UseInterceptors,
  CacheInterceptor,
  CacheTTL,
} from '@nestjs/common';
import { ApiResponse }from '@nestjs/swagger';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { CustodiansService } from './custodians.service';
import { CreateCustodianDto } from './dto/create-custodian.dto';
import { UpdateCustodianDto } from './dto/update-custodian.dto';
import { QueryCustodianDto } from './dto/query-custodian.dto';


@UseGuards(JwtAuthGuard)
@Controller('custodians')
@UseInterceptors(CacheInterceptor)
export class CustodiansController {
  constructor(private readonly custodiansService: CustodiansService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() createDto: CreateCustodianDto) {
    return await this.custodiansService.create(createDto);
  }

  @Get()
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() queryDto: QueryCustodianDto) {
    return await this.custodiansService.findAll(queryDto);
  }

  @Get('statistics/:caseId')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStatistics(@Param('caseId') caseId: string) {
    return await this.custodiansService.getStatistics(caseId);
  }

  @Get(':id')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string) {
    return await this.custodiansService.findOne(id);
  }

  @Put(':id')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCustodianDto,
  ) {
    return await this.custodiansService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async remove(@Param('id') id: string) {
    await this.custodiansService.remove(id);
  }
}

