import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RlsPoliciesService } from './rls-policies.service';
import {
  CreateRlsPolicyDto,
  UpdateRlsPolicyDto,
  QueryRlsPoliciesDto,
} from './dto/rls-policy.dto';

@Controller('api/v1/security/rls-policies')
export class RlsPoliciesController {
  constructor(private readonly rlsPoliciesService: RlsPoliciesService) {}

  @Get()
  async findAll(@Query() query: QueryRlsPoliciesDto) {
    return this.rlsPoliciesService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateRlsPolicyDto) {
    return this.rlsPoliciesService.create(dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.rlsPoliciesService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRlsPolicyDto) {
    return this.rlsPoliciesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.rlsPoliciesService.remove(id);
  }
}
