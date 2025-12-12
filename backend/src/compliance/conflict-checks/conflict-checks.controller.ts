import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConflictChecksService } from './conflict-checks.service';
import {
  RunConflictCheckDto,
  ResolveConflictDto,
  WaiveConflictDto,
  QueryConflictChecksDto,
} from './dto/conflict-check.dto';

@Controller('api/v1/compliance/conflicts')
export class ConflictChecksController {
  constructor(
    private readonly conflictChecksService: ConflictChecksService,
  ) {}

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
