import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AiDataopsService } from './ai-dataops.service';
import { StoreEmbeddingDto } from './dto/store-embedding.dto';
import { SearchEmbeddingsDto } from './dto/search-embeddings.dto';
import { RegisterModelDto } from './dto/register-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';

@ApiTags('AI DataOps')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('ai-dataops')
export class AiDataopsController {
  constructor(private readonly aiDataopsService: AiDataopsService) {}

  @Get('embeddings')
  @ApiOperation({ summary: 'Get all vector embeddings' })
  @ApiResponse({ status: 200, description: 'Embeddings retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getEmbeddings() {
    return await this.aiDataopsService.getEmbeddings();
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
    return await this.aiDataopsService.storeEmbedding(dto);
  }

  @Post('embeddings/search')
  @ApiOperation({ summary: 'Search similar vectors' })
  @ApiResponse({ status: 200, description: 'Similar embeddings retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async searchSimilar(@Body() dto: SearchEmbeddingsDto) {
    return await this.aiDataopsService.searchSimilar(dto);
  }

  @Get('models')
  @ApiOperation({ summary: 'Get all AI models' })
  @ApiResponse({ status: 200, description: 'Models retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getModels() {
    return await this.aiDataopsService.getModels();
  }

  @Post('models')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new AI model' })
  @ApiResponse({ status: 201, description: 'Model registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async registerModel(@Body() dto: RegisterModelDto) {
    return await this.aiDataopsService.registerModel(dto);
  }

  @Put('models/:id')
  @ApiOperation({ summary: 'Update AI model' })
  @ApiResponse({ status: 200, description: 'Model updated successfully' })
  @ApiResponse({ status: 404, description: 'Model not found' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateModel(@Param('id') id: string, @Body() dto: UpdateModelDto) {
    return await this.aiDataopsService.updateModel(id, dto);
  }

  @Delete('models/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete AI model' })
  @ApiResponse({ status: 204, description: 'Model deleted successfully' })
  @ApiResponse({ status: 404, description: 'Model not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deleteModel(@Param('id') id: string) {
    await this.aiDataopsService.deleteModel(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get AI DataOps statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStats() {
    return await this.aiDataopsService.getStats();
  }
}
