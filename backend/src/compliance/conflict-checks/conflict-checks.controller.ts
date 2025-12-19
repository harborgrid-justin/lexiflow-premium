import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Head,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation , ApiResponse }from '@nestjs/swagger';
import { ConflictChecksService } from './conflict-checks.service';
import {
  RunConflictCheckDto,
  ResolveConflictDto,
  WaiveConflictDto,
  QueryConflictChecksDto,
} from './dto/conflict-check.dto';

@ApiTags('Compliance - Conflict Checks')
@ApiBearerAuth('JWT-auth')

@Controller('compliance/conflicts')
export class ConflictChecksController {
  constructor(
    private readonly conflictChecksService: ConflictChecksService,
  ) {}

  @Head()
  @HttpCode(HttpStatus.OK)
  async health() {
    return;
  }

  @Get()
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() query: QueryConflictChecksDto) {
    return this.conflictChecksService.findAll(query);
  }

  @Post('check')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async runCheck(@Body() dto: RunConflictCheckDto) {
    return this.conflictChecksService.runCheck(dto);
  }

  @Get(':id')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string) {
    return this.conflictChecksService.findOne(id);
  }

  @Post(':id/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async resolve(@Param('id') id: string, @Body() dto: ResolveConflictDto) {
    return this.conflictChecksService.resolve(id, dto);
  }

  @Post(':id/waive')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async waive(@Param('id') id: string, @Body() dto: WaiveConflictDto) {
    return this.conflictChecksService.waive(id, dto);
  }
}

