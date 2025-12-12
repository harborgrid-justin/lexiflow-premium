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
  Patch,
} from '@nestjs/common';
import { EthicalWallsService } from './ethical-walls.service';
import {
  CreateEthicalWallDto,
  UpdateEthicalWallDto,
  QueryEthicalWallsDto,
} from './dto/ethical-wall.dto';

@Controller('api/v1/compliance/ethical-walls')
export class EthicalWallsController {
  constructor(private readonly ethicalWallsService: EthicalWallsService) {}

  @Get()
  async findAll(@Query() query: QueryEthicalWallsDto) {
    return this.ethicalWallsService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateEthicalWallDto) {
    return this.ethicalWallsService.create(dto);
  }

  @Get('user/:userId')
  async checkWallsForUser(@Param('userId') userId: string) {
    return this.ethicalWallsService.checkWallsForUser(userId);
  }

  @Get('notifications/:userId')
  async getNotifications(@Param('userId') userId: string) {
    return this.ethicalWallsService.getNotifications(userId);
  }

  @Patch('notifications/:notificationId/read')
  async markNotificationRead(@Param('notificationId') notificationId: string) {
    return this.ethicalWallsService.markNotificationRead(notificationId);
  }

  @Get('audit/:wallId')
  async getAuditTrail(@Param('wallId') wallId: string) {
    return this.ethicalWallsService.getAuditTrail(wallId);
  }

  @Get('audit')
  async getAllAuditEntries(@Query('organizationId') organizationId?: string) {
    return this.ethicalWallsService.getAllAuditEntries(organizationId);
  }

  @Get('breaches/all')
  async getAllBreaches(@Query('wallId') wallId?: string) {
    return this.ethicalWallsService.getBreaches(wallId);
  }

  @Post('breaches')
  @HttpCode(HttpStatus.CREATED)
  async reportBreach(@Body() dto: any) {
    return this.ethicalWallsService.reportBreach(dto);
  }

  @Patch('breaches/:breachId/resolve')
  async resolveBreach(
    @Param('breachId') breachId: string,
    @Body('resolvedBy') resolvedBy: string,
  ) {
    return this.ethicalWallsService.resolveBreach(breachId, resolvedBy);
  }

  @Get('metrics/:wallId')
  async getWallMetrics(@Param('wallId') wallId: string) {
    return this.ethicalWallsService.getWallMetrics(wallId);
  }

  @Get('metrics/organization/:organizationId')
  async getAllWallMetrics(@Param('organizationId') organizationId: string) {
    return this.ethicalWallsService.getAllWallMetrics(organizationId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ethicalWallsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEthicalWallDto) {
    return this.ethicalWallsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.ethicalWallsService.remove(id);
  }
}
