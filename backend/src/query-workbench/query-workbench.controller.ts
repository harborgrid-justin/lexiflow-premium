import { Controller, Get, Post, Delete, Body, Param, Query, Head, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { QueryWorkbenchService } from './query-workbench.service';
import { ExecuteQueryDto, SaveQueryDto } from './dto/execute-query.dto';
import { Public } from '@common/decorators/public.decorator';
import { AuthenticatedRequest } from './interfaces/query-workbench.interfaces';

@ApiTags('Query Workbench')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)

@Controller('query-workbench')
export class QueryWorkbenchController {
  constructor(private readonly queryService: QueryWorkbenchService) {}

  @Public()
  @Head('health')
  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() {
    return { status: 'ok', service: 'query-workbench' };
  }

  @Post('execute')
  @ApiOperation({ summary: 'Execute a SQL query' })
  @ApiResponse({ status: 200, description: 'Query executed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async executeQuery(@Body() dto: ExecuteQueryDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.id || 'system';
    return await this.queryService.executeQuery(dto, userId);
  }

  @Post('explain')
  @ApiOperation({ summary: 'Get query execution plan' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async explainQuery(@Body() dto: ExecuteQueryDto) {
    return await this.queryService.explainQuery(dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get query history' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getHistory(@Req() req: AuthenticatedRequest, @Query('limit') limit?: number) {
    const userId = req.user?.id || 'system';
    return await this.queryService.getHistory(userId, limit);
  }

  @Get('saved')
  @ApiOperation({ summary: 'Get saved queries' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getSavedQueries(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.id || 'system';
    return await this.queryService.getSavedQueries(userId);
  }

  @Post('saved')
  @ApiOperation({ summary: 'Save a query' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async saveQuery(@Body() dto: SaveQueryDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.id || 'system';
    return await this.queryService.saveQuery(dto, userId);
  }

  @Delete('saved/:id')
  @ApiOperation({ summary: 'Delete a saved query' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async deleteSavedQuery(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.id || 'system';
    return await this.queryService.deleteSavedQuery(id, userId);
  }
}
