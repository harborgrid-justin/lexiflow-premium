import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SearchService } from './search.service';
import {
  SearchQueryDto,
  SearchSuggestionsDto,
  ReindexDto,
  SearchEntityType,
} from './dto/search-query.dto';
import {
  SearchResultDto,
  SearchSuggestionsResultDto,
  ReindexResultDto,
} from './dto/search-result.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Search')
@Controller('api/v1/search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Global search across all entities' })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: SearchResultDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'query', required: true, description: 'Search query string' })
  @ApiQuery({ name: 'entityType', required: false, enum: SearchEntityType })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async search(@Query() queryDto: SearchQueryDto): Promise<SearchResultDto> {
    return this.searchService.search(queryDto);
  }

  @Get('cases')
  @ApiOperation({ summary: 'Search cases only' })
  @ApiResponse({
    status: 200,
    description: 'Case search results',
    type: SearchResultDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async searchCases(@Query() queryDto: SearchQueryDto): Promise<SearchResultDto> {
    queryDto.entityType = SearchEntityType.CASE;
    return this.searchService.search(queryDto);
  }

  @Get('documents')
  @ApiOperation({ summary: 'Search documents only' })
  @ApiResponse({
    status: 200,
    description: 'Document search results',
    type: SearchResultDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async searchDocuments(@Query() queryDto: SearchQueryDto): Promise<SearchResultDto> {
    queryDto.entityType = SearchEntityType.DOCUMENT;
    return this.searchService.search(queryDto);
  }

  @Get('clients')
  @ApiOperation({ summary: 'Search clients only' })
  @ApiResponse({
    status: 200,
    description: 'Client search results',
    type: SearchResultDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async searchClients(@Query() queryDto: SearchQueryDto): Promise<SearchResultDto> {
    queryDto.entityType = SearchEntityType.CLIENT;
    return this.searchService.search(queryDto);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions/autocomplete' })
  @ApiResponse({
    status: 200,
    description: 'Search suggestions',
    type: SearchSuggestionsResultDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSuggestions(
    @Query() dto: SearchSuggestionsDto,
  ): Promise<SearchSuggestionsResultDto> {
    return this.searchService.getSuggestions(dto);
  }

  @Post('reindex')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Reindex search data (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Reindex completed',
    type: ReindexResultDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async reindex(@Query() dto: ReindexDto): Promise<ReindexResultDto> {
    return this.searchService.reindex(dto);
  }
}
