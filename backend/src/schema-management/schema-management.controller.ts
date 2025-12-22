import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation , ApiResponse }from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SchemaManagementService } from './schema-management.service';
import { CreateMigrationDto, CreateSnapshotDto, CreateTableDto } from './dto/create-migration.dto';

@ApiTags('Schema Management')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)

@Controller('schema')
export class SchemaManagementController {
  constructor(private readonly schemaService: SchemaManagementService) {}

  // ==================== SCHEMA INSPECTION ====================

  @Get('tables')
  @ApiOperation({ summary: 'Get all database tables with columns' })
  @ApiResponse({ status: 200, description: 'Tables retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getTables() {
    return await this.schemaService.getTables();
  }

  @Get('tables/:name/columns')
  @ApiOperation({ summary: 'Get columns for a specific table' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getTableColumns(@Param('name') name: string) {
    return await this.schemaService.getTableColumns(name);
  }

  // ==================== MIGRATIONS ====================

  @Get('migrations')
  @ApiOperation({ summary: 'Get all migrations' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getMigrations() {
    return await this.schemaService.getMigrations();
  }

  @Post('migrations')
  @ApiOperation({ summary: 'Create a new migration' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async createMigration(@Body() dto: CreateMigrationDto, @Req() req: any) {
    const userId = req.user?.id || 'system';
    return await this.schemaService.createMigration(dto, userId);
  }

  @Post('migrations/:id/apply')
  @ApiOperation({ summary: 'Apply a migration' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async applyMigration(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || 'system';
    return await this.schemaService.applyMigration(id, userId);
  }

  @Post('migrations/:id/revert')
  @ApiOperation({ summary: 'Revert a migration' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async revertMigration(@Param('id') id: string) {
    return await this.schemaService.revertMigration(id);
  }

  // ==================== SNAPSHOTS ====================

  @Get('snapshots')
  @ApiOperation({ summary: 'Get all schema snapshots' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getSnapshots() {
    return await this.schemaService.getSnapshots();
  }

  @Get('snapshots/:id')
  @ApiOperation({ summary: 'Get a specific snapshot' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async getSnapshot(@Param('id') id: string) {
    return await this.schemaService.getSnapshot(id);
  }

  @Post('snapshots')
  @ApiOperation({ summary: 'Create a schema snapshot' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async createSnapshot(@Body() dto: CreateSnapshotDto, @Req() req: any) {
    const userId = req.user?.id || 'system';
    return await this.schemaService.createSnapshot(dto, userId);
  }

  @Delete('snapshots/:id')
  @ApiOperation({ summary: 'Delete a snapshot' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async deleteSnapshot(@Param('id') id: string) {
    return await this.schemaService.deleteSnapshot(id);
  }

  // ==================== TABLE OPERATIONS ====================

  @Post('tables')
  @ApiOperation({ summary: 'Create a new table' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async createTable(@Body() dto: CreateTableDto) {
    return await this.schemaService.createTable(dto);
  }

  @Delete('tables/:name')
  @ApiOperation({ summary: 'Drop a table' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async dropTable(@Param('name') name: string) {
    return await this.schemaService.dropTable(name);
  }
}
