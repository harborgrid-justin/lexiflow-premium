import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  HttpCode, 
  HttpStatus,
  UseGuards,
  UsePipes,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiQuery,
 }from '@nestjs/swagger';
import { KnowledgeService } from './knowledge.service';
import { CreateKnowledgeArticleDto, UpdateKnowledgeArticleDto, QueryKnowledgeDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Knowledge Base')
@ApiBearerAuth('JWT-auth')
@Controller('knowledge')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  // Health check endpoint
  @Get()
  
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async health() {
    return { status: 'ok', service: 'knowledge' };
  }

  @Get('articles')
  
  @ApiOperation({ summary: 'Get all knowledge articles' })
  @ApiResponse({ status: 200, description: 'Returns list of articles' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'tags', required: false, type: [String] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getArticles(@Query() query: QueryKnowledgeDto) {
    return this.knowledgeService.findAll(query);
  }

  @Get('articles/popular')
  
  @ApiOperation({ summary: 'Get popular articles' })
  @ApiResponse({ status: 200, description: 'Returns popular articles' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getPopular(@Query('limit') limit?: number) {
    return this.knowledgeService.getPopular(limit);
  }

  @Get('articles/recent')
  
  @ApiOperation({ summary: 'Get recent articles' })
  @ApiResponse({ status: 200, description: 'Returns recent articles' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getRecent(@Query('limit') limit?: number) {
    return this.knowledgeService.getRecent(limit);
  }

  @Get('articles/:id')
  
  @ApiOperation({ summary: 'Get article by ID' })
  @ApiResponse({ status: 200, description: 'Returns the article' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getArticle(@Param('id') id: string) {
    return this.knowledgeService.findOne(id);
  }

  @Get('search')
  
  @ApiOperation({ summary: 'Search knowledge base' })
  @ApiResponse({ status: 200, description: 'Returns search results' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async search(@Query('q') query: string) {
    return this.knowledgeService.search(query);
  }

  @Get('categories')
  
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Returns list of categories' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getCategories() {
    return this.knowledgeService.getCategories();
  }

  @Get('tags')
  
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({ status: 200, description: 'Returns list of tags' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getTags() {
    return this.knowledgeService.getAllTags();
  }

  @Post('articles')
  @HttpCode(HttpStatus.CREATED)
  @Roles('admin', 'attorney')
  @UsePipes(new NestValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create knowledge article' })
  @ApiResponse({ status: 201, description: 'Article created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async createArticle(
    @Body() createDto: CreateKnowledgeArticleDto,
    @CurrentUser('id') userId: string,
  ) {
    createDto.authorId = userId;
    return this.knowledgeService.create(createDto);
  }

  @Put('articles/:id')
  @Roles('admin', 'attorney')
  @UsePipes(new NestValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Update knowledge article' })
  @ApiResponse({ status: 200, description: 'Article updated successfully' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateArticle(
    @Param('id') id: string,
    @Body() updateDto: UpdateKnowledgeArticleDto,
  ) {
    return this.knowledgeService.update(id, updateDto);
  }

  @Delete('articles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete knowledge article' })
  @ApiResponse({ status: 204, description: 'Article deleted successfully' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiParam({ name: 'id', description: 'Article UUID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteArticle(@Param('id') id: string) {
    await this.knowledgeService.remove(id);
  }
}

