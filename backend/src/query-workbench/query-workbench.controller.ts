import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { QueryWorkbenchService } from './query-workbench.service';
import { ExecuteQueryDto, SaveQueryDto } from './dto/execute-query.dto';

@ApiTags('Query Workbench')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Public() // Remove in production
@Controller('query-workbench')
export class QueryWorkbenchController {
  constructor(private readonly queryService: QueryWorkbenchService) {}

  @Post('execute')
  @ApiOperation({ summary: 'Execute a SQL query' })
  @ApiResponse({ status: 200, description: 'Query executed successfully' })
  async executeQuery(@Body() dto: ExecuteQueryDto, @Req() req: any) {
    const userId = req.user?.id || 'system';
    return await this.queryService.executeQuery(dto, userId);
  }

  @Post('explain')
  @ApiOperation({ summary: 'Get query execution plan' })
  async explainQuery(@Body() dto: ExecuteQueryDto) {
    return await this.queryService.explainQuery(dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get query history' })
  async getHistory(@Req() req: any, @Query('limit') limit?: number) {
    const userId = req.user?.id || 'system';
    return await this.queryService.getHistory(userId, limit);
  }

  @Get('saved')
  @ApiOperation({ summary: 'Get saved queries' })
  async getSavedQueries(@Req() req: any) {
    const userId = req.user?.id || 'system';
    return await this.queryService.getSavedQueries(userId);
  }

  @Post('saved')
  @ApiOperation({ summary: 'Save a query' })
  async saveQuery(@Body() dto: SaveQueryDto, @Req() req: any) {
    const userId = req.user?.id || 'system';
    return await this.queryService.saveQuery(dto, userId);
  }

  @Delete('saved/:id')
  @ApiOperation({ summary: 'Delete a saved query' })
  async deleteSavedQuery(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || 'system';
    return await this.queryService.deleteSavedQuery(id, userId);
  }
}
