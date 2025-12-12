import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { ConflictChecksService } from './conflict-checks.service';
import {
  RunConflictCheckDto,
  ResolveConflictDto,
  WaiveConflictDto,
  QueryConflictChecksDto,
  BatchConflictCheckDto,
  HistoricalConflictSearchDto,
  PartyConflictCheckDto,
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

  @Post('check/batch')
  @HttpCode(HttpStatus.CREATED)
  async runBatchCheck(@Body() dto: BatchConflictCheckDto) {
    return this.conflictChecksService.runBatchCheck(dto);
  }

  @Post('check/parties')
  @HttpCode(HttpStatus.CREATED)
  async checkPartyConflicts(@Body() dto: PartyConflictCheckDto) {
    return this.conflictChecksService.checkPartyConflicts(dto);
  }

  @Post('search/historical')
  @HttpCode(HttpStatus.OK)
  async searchHistorical(@Body() dto: HistoricalConflictSearchDto) {
    return this.conflictChecksService.searchHistoricalConflicts(dto);
  }

  @Get('similar-clients/:name')
  async findSimilarClients(
    @Param('name') name: string,
    @Query('threshold') threshold?: number,
  ) {
    return this.conflictChecksService.findSimilarClients(name, threshold);
  }

  @Get('statistics/:organizationId')
  async getStatistics(@Param('organizationId') organizationId: string) {
    return this.conflictChecksService.getConflictStatistics(organizationId);
  }

  @Get('notifications/:userId')
  async getNotifications(@Param('userId') userId: string) {
    return this.conflictChecksService.getNotifications(userId);
  }

  @Patch('notifications/:notificationId/read')
  async markNotificationRead(@Param('notificationId') notificationId: string) {
    return this.conflictChecksService.markNotificationRead(notificationId);
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
