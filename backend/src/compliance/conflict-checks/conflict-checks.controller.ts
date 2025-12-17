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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConflictChecksService } from './conflict-checks.service';
import {
  RunConflictCheckDto,
  ResolveConflictDto,
  WaiveConflictDto,
  QueryConflictChecksDto,
} from './dto/conflict-check.dto';

@ApiTags('Compliance - Conflict Checks')
@ApiBearerAuth('JWT-auth')
@Public() // Allow public access for development
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
  async findAll(@Query() query: QueryConflictChecksDto) {
    return this.conflictChecksService.findAll(query);
  }

  @Post('check')
  @HttpCode(HttpStatus.CREATED)
  async runCheck(@Body() dto: RunConflictCheckDto) {
    return this.conflictChecksService.runCheck(dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.conflictChecksService.findOne(id);
  }

  @Post(':id/resolve')
  @HttpCode(HttpStatus.OK)
  async resolve(@Param('id') id: string, @Body() dto: ResolveConflictDto) {
    return this.conflictChecksService.resolve(id, dto);
  }

  @Post(':id/waive')
  @HttpCode(HttpStatus.OK)
  async waive(@Param('id') id: string, @Body() dto: WaiveConflictDto) {
    return this.conflictChecksService.waive(id, dto);
  }
}

