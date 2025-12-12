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
import { CustodiansService } from './custodians.service';
import { CreateCustodianDto } from './dto/create-custodian.dto';
import { UpdateCustodianDto } from './dto/update-custodian.dto';
import { QueryCustodianDto } from './dto/query-custodian.dto';

@Controller('api/v1/discovery/custodians')
export class CustodiansController {
  constructor(private readonly custodiansService: CustodiansService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateCustodianDto) {
    return await this.custodiansService.create(createDto);
  }

  @Get()
  async findAll(@Query() queryDto: QueryCustodianDto) {
    return await this.custodiansService.findAll(queryDto);
  }

  @Get('statistics/:caseId')
  async getStatistics(@Param('caseId') caseId: string) {
    return await this.custodiansService.getStatistics(caseId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.custodiansService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCustodianDto,
  ) {
    return await this.custodiansService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.custodiansService.remove(id);
  }
}
