import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AiOpsService } from './ai-ops.service';

@ApiTags('AI Operations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Public()
@Controller('ai-ops')
export class AiOpsController {
  constructor(private readonly aiOpsService: AiOpsService) {}

  @Get('embeddings')
  @ApiOperation({ summary: 'Get vector embeddings' })
  async getEmbeddings(@Query() query: any) {
    return await this.aiOpsService.getEmbeddings(query);
  }

  @Post('embeddings')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Store vector embedding' })
  async storeEmbedding(@Body() body: any) {
    return await this.aiOpsService.storeEmbedding(body);
  }

  @Post('embeddings/search')
  @ApiOperation({ summary: 'Search similar vectors' })
  async searchSimilar(@Body() body: { embedding: number[]; limit?: number }) {
    return await this.aiOpsService.searchSimilar(body.embedding, body.limit);
  }

  @Get('models')
  @ApiOperation({ summary: 'Get AI models' })
  async getModels() {
    return await this.aiOpsService.getModels();
  }

  @Post('models')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register AI model' })
  async registerModel(@Body() body: any) {
    return await this.aiOpsService.registerModel(body);
  }

  @Put('models/:id')
  @ApiOperation({ summary: 'Update AI model' })
  async updateModel(@Param('id') id: string, @Body() body: any) {
    return await this.aiOpsService.updateModel(id, body);
  }

  @Delete('models/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete AI model' })
  async deleteModel(@Param('id') id: string) {
    await this.aiOpsService.deleteModel(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get AI operations statistics' })
  async getStats() {
    return await this.aiOpsService.getStats();
  }
}
