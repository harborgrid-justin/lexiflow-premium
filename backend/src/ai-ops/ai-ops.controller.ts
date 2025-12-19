import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation , ApiResponse }from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AiOpsService } from './ai-ops.service';
import { GetEmbeddingsQueryDto, StoreEmbeddingDto, SearchSimilarDto } from './dto/embedding.dto';
import { RegisterModelDto, UpdateModelDto } from './dto/model.dto';

@ApiTags('AI Operations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)

@Controller('ai-ops')
export class AiOpsController {
  constructor(private readonly aiOpsService: AiOpsService) {}

  @Get('embeddings')
  @ApiOperation({ summary: 'Get vector embeddings' })
  @ApiResponse({ status: 200, description: 'Embeddings retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getEmbeddings(@Query() query: GetEmbeddingsQueryDto) {
    return await this.aiOpsService.getEmbeddings(query);
  }

  @Post('embeddings')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Store vector embedding' })
  @ApiResponse({ status: 201, description: 'Embedding stored successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async storeEmbedding(@Body() dto: StoreEmbeddingDto) {
    return await this.aiOpsService.storeEmbedding(dto);
  }

  @Post('embeddings/search')
  @ApiOperation({ summary: 'Search similar vectors' })
  @ApiResponse({ status: 200, description: 'Similar embeddings retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async searchSimilar(@Body() dto: SearchSimilarDto) {
    return await this.aiOpsService.searchSimilar(dto.embedding, dto.limit);
  }

  @Get('models')
  @ApiOperation({ summary: 'Get AI models' })
  @ApiResponse({ status: 200, description: 'Models retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getModels() {
    return await this.aiOpsService.getModels();
  }

  @Post('models')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register AI model' })
  @ApiResponse({ status: 201, description: 'Model registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async registerModel(@Body() dto: RegisterModelDto) {
    return await this.aiOpsService.registerModel(dto);
  }

  @Put('models/:id')
  @ApiOperation({ summary: 'Update AI model' })
  @ApiResponse({ status: 200, description: 'Model updated successfully' })
  @ApiResponse({ status: 404, description: 'Model not found' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateModel(@Param('id') id: string, @Body() dto: UpdateModelDto) {
    return await this.aiOpsService.updateModel(id, dto);
  }

  @Delete('models/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete AI model' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async deleteModel(@Param('id') id: string) {
    await this.aiOpsService.deleteModel(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get AI operations statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStats() {
    return await this.aiOpsService.getStats();
  }
}
