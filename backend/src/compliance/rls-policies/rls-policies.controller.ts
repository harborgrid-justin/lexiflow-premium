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
import { ApiTags, ApiOperation, ApiBearerAuth , ApiResponse }from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { RlsPoliciesService } from './rls-policies.service';
import {
  CreateRlsPolicyDto,
  UpdateRlsPolicyDto,
  QueryRlsPoliciesDto,
} from './dto/rls-policy.dto';


@Controller('security/rls-policies')
export class RlsPoliciesController {
  constructor(private readonly rlsPoliciesService: RlsPoliciesService) {}

  @Get()
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() query: QueryRlsPoliciesDto) {
    return this.rlsPoliciesService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() dto: CreateRlsPolicyDto) {
    return this.rlsPoliciesService.create(dto);
  }

  @Get(':id')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string) {
    return this.rlsPoliciesService.findOne(id);
  }

  @Put(':id')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateRlsPolicyDto) {
    return this.rlsPoliciesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async remove(@Param('id') id: string) {
    return this.rlsPoliciesService.remove(id);
  }
}

