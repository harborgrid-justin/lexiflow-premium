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
import { CustodianInterviewsService } from './custodian-interviews.service';
import { CreateCustodianInterviewDto } from './dto/create-custodian-interview.dto';
import { UpdateCustodianInterviewDto } from './dto/update-custodian-interview.dto';
import { QueryCustodianInterviewDto } from './dto/query-custodian-interview.dto';

@Controller('api/v1/discovery/interviews')
export class CustodianInterviewsController {
  constructor(
    private readonly interviewsService: CustodianInterviewsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateCustodianInterviewDto) {
    return await this.interviewsService.create(createDto);
  }

  @Get()
  async findAll(@Query() queryDto: QueryCustodianInterviewDto) {
    return await this.interviewsService.findAll(queryDto);
  }

  @Get('statistics/:caseId')
  async getStatistics(@Param('caseId') caseId: string) {
    return await this.interviewsService.getStatistics(caseId);
  }

  @Get('custodian/:custodianId')
  async getByCustodian(@Param('custodianId') custodianId: string) {
    return await this.interviewsService.getByCustodian(custodianId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.interviewsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCustodianInterviewDto,
  ) {
    return await this.interviewsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.interviewsService.remove(id);
  }
}
