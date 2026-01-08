import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { LegalResearchService, CombinedSearchQuery } from './legal-research.service';
import { CaseLawSearchService, CaseLawSearchQuery } from './case-law-search.service';
import { StatuteSearchService, StatuteSearchQuery } from './statute-search.service';
import { ResearchHistoryService, UpdateResearchQueryDto } from './research-history.service';
import { CitationParserService } from './citation-parser.service';
import { CaseLawJurisdiction, CaseLawCourt } from './entities/case-law.entity';
import { StatuteJurisdiction, StatuteType } from './entities/statute.entity';
import { QueryType } from './entities/research-query.entity';

/**
 * Legal Research Controller
 * Provides REST API endpoints for legal research functionality
 */
@ApiTags('Legal Research')
@Controller('legal-research')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LegalResearchController {
  constructor(
    private readonly legalResearchService: LegalResearchService,
    private readonly caseLawSearchService: CaseLawSearchService,
    private readonly statuteSearchService: StatuteSearchService,
    private readonly researchHistoryService: ResearchHistoryService,
    private readonly citationParserService: CitationParserService,
  ) {}

  /**
   * Combined search across case law and statutes
   */
  @Post('search')
  @ApiOperation({ summary: 'Perform combined legal research search' })
  @ApiResponse({ status: 200, description: 'Search results returned successfully' })
  async search(
    @Body()
    searchDto: {
      query: string;
      searchType?: 'all' | 'case_law' | 'statute';
      caseLawFilters?: Partial<CaseLawSearchQuery>;
      statuteFilters?: Partial<StatuteSearchQuery>;
      limit?: number;
      offset?: number;
      saveToHistory?: boolean;
    },
    @Req() req: any,
  ) {
    const userId = req.user?.id;

    return this.legalResearchService.performCombinedSearch({
      ...searchDto,
      userId,
      searchType: searchDto.searchType || 'all',
    });
  }

  /**
   * Search case law only
   */
  @Post('case-law/search')
  @ApiOperation({ summary: 'Search case law with advanced filters' })
  @ApiResponse({ status: 200, description: 'Case law search results' })
  async searchCaseLaw(
    @Body()
    searchDto: {
      query?: string;
      jurisdiction?: CaseLawJurisdiction[];
      court?: CaseLawCourt[];
      dateFrom?: string;
      dateTo?: string;
      topics?: string[];
      keyNumber?: string;
      isBinding?: boolean;
      sortBy?: 'relevance' | 'date' | 'citations';
      sortOrder?: 'ASC' | 'DESC';
      limit?: number;
      offset?: number;
    },
  ) {
    return this.caseLawSearchService.searchCaseLaw({
      ...searchDto,
      dateFrom: searchDto.dateFrom ? new Date(searchDto.dateFrom) : undefined,
      dateTo: searchDto.dateTo ? new Date(searchDto.dateTo) : undefined,
    });
  }

  /**
   * Get case law by ID
   */
  @Get('case-law/:id')
  @ApiOperation({ summary: 'Get case law by ID' })
  @ApiResponse({ status: 200, description: 'Case law details' })
  @ApiResponse({ status: 404, description: 'Case law not found' })
  async getCaseLawById(@Param('id') id: string) {
    return this.caseLawSearchService.getCaseLawById(id);
  }

  /**
   * Get case law by citation
   */
  @Get('case-law/citation/:citation')
  @ApiOperation({ summary: 'Get case law by citation' })
  @ApiResponse({ status: 200, description: 'Case law details' })
  @ApiResponse({ status: 404, description: 'Case law not found' })
  async getCaseLawByCitation(@Param('citation') citation: string) {
    return this.caseLawSearchService.getCaseLawByCitation(citation);
  }

  /**
   * Get Shepard's-style citation analysis
   */
  @Get('case-law/:id/citation-analysis')
  @ApiOperation({ summary: 'Get comprehensive citation analysis for a case' })
  @ApiResponse({ status: 200, description: 'Citation analysis with treatment signals' })
  async getCitationAnalysis(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.legalResearchService.getCitationAnalysis(id, userId);
  }

  /**
   * Get cases citing this case
   */
  @Get('case-law/:id/citing-cases')
  @ApiOperation({ summary: 'Get cases that cite this case' })
  @ApiResponse({ status: 200, description: 'List of citing cases' })
  async getCitingCases(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    return this.caseLawSearchService.getCitingCases(id, limit || 50);
  }

  /**
   * Get cases cited by this case
   */
  @Get('case-law/:id/cited-cases')
  @ApiOperation({ summary: 'Get cases cited by this case' })
  @ApiResponse({ status: 200, description: 'List of cited cases' })
  async getCitedCases(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    return this.caseLawSearchService.getCitedCases(id, limit || 50);
  }

  /**
   * Get similar cases
   */
  @Get('case-law/:id/similar')
  @ApiOperation({ summary: 'Get similar cases based on topics and key numbers' })
  @ApiResponse({ status: 200, description: 'List of similar cases' })
  async getSimilarCases(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    return this.caseLawSearchService.getSimilarCases(id, limit || 10);
  }

  /**
   * Get most cited cases
   */
  @Get('case-law/trending/most-cited')
  @ApiOperation({ summary: 'Get most cited cases' })
  @ApiResponse({ status: 200, description: 'List of most cited cases' })
  async getMostCitedCases(
    @Query('jurisdiction') jurisdiction?: CaseLawJurisdiction,
    @Query('limit') limit?: number,
  ) {
    return this.caseLawSearchService.getMostCitedCases(jurisdiction, limit || 100);
  }

  /**
   * Search statutes
   */
  @Post('statutes/search')
  @ApiOperation({ summary: 'Search statutes with advanced filters' })
  @ApiResponse({ status: 200, description: 'Statute search results' })
  async searchStatutes(
    @Body()
    searchDto: {
      query?: string;
      jurisdiction?: StatuteJurisdiction[];
      type?: StatuteType[];
      state?: string;
      code?: string;
      section?: string;
      topics?: string[];
      isActive?: boolean;
      dateFrom?: string;
      dateTo?: string;
      sortBy?: 'relevance' | 'date' | 'citations';
      sortOrder?: 'ASC' | 'DESC';
      limit?: number;
      offset?: number;
    },
  ) {
    return this.statuteSearchService.searchStatutes({
      ...searchDto,
      dateFrom: searchDto.dateFrom ? new Date(searchDto.dateFrom) : undefined,
      dateTo: searchDto.dateTo ? new Date(searchDto.dateTo) : undefined,
    });
  }

  /**
   * Get statute by ID
   */
  @Get('statutes/:id')
  @ApiOperation({ summary: 'Get statute by ID' })
  @ApiResponse({ status: 200, description: 'Statute details' })
  @ApiResponse({ status: 404, description: 'Statute not found' })
  async getStatuteById(@Param('id') id: string) {
    return this.statuteSearchService.getStatuteById(id);
  }

  /**
   * Get statute by code and section
   */
  @Get('statutes/code/:code/section/:section')
  @ApiOperation({ summary: 'Get statute by code and section' })
  @ApiResponse({ status: 200, description: 'Statute details' })
  @ApiResponse({ status: 404, description: 'Statute not found' })
  async getStatuteByCodeSection(
    @Param('code') code: string,
    @Param('section') section: string,
  ) {
    return this.statuteSearchService.getStatuteByCodeSection(code, section);
  }

  /**
   * Get statute citation information
   */
  @Get('statutes/:id/citations')
  @ApiOperation({ summary: 'Get citation information for a statute' })
  @ApiResponse({ status: 200, description: 'Statute citation information' })
  async getStatuteCitationInfo(@Param('id') id: string) {
    return this.statuteSearchService.getStatuteCitationInfo(id);
  }

  /**
   * Get related statutes
   */
  @Get('statutes/:id/related')
  @ApiOperation({ summary: 'Get related statutes' })
  @ApiResponse({ status: 200, description: 'List of related statutes' })
  async getRelatedStatutes(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    return this.statuteSearchService.getRelatedStatutes(id, limit || 10);
  }

  /**
   * Get statutes by code
   */
  @Get('statutes/code/:code')
  @ApiOperation({ summary: 'Get all sections of a code' })
  @ApiResponse({ status: 200, description: 'List of statute sections' })
  async getStatutesByCode(
    @Param('code') code: string,
    @Query('limit') limit?: number,
  ) {
    return this.statuteSearchService.getStatutesByCode(code, limit || 100);
  }

  /**
   * Get most cited statutes
   */
  @Get('statutes/trending/most-cited')
  @ApiOperation({ summary: 'Get most cited statutes' })
  @ApiResponse({ status: 200, description: 'List of most cited statutes' })
  async getMostCitedStatutes(
    @Query('jurisdiction') jurisdiction?: StatuteJurisdiction,
    @Query('limit') limit?: number,
  ) {
    return this.statuteSearchService.getMostCitedStatutes(jurisdiction, limit || 100);
  }

  /**
   * Get recently amended statutes
   */
  @Get('statutes/trending/recently-amended')
  @ApiOperation({ summary: 'Get recently amended statutes' })
  @ApiResponse({ status: 200, description: 'List of recently amended statutes' })
  async getRecentlyAmendedStatutes(@Query('limit') limit?: number) {
    return this.statuteSearchService.getRecentlyAmendedStatutes(limit || 50);
  }

  /**
   * Search by citation
   */
  @Get('citation/:citation')
  @ApiOperation({ summary: 'Search by citation (Bluebook format)' })
  @ApiResponse({ status: 200, description: 'Citation search results' })
  async searchByCitation(@Param('citation') citation: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.legalResearchService.searchByCitation(citation, userId);
  }

  /**
   * Parse citation
   */
  @Post('citation/parse')
  @ApiOperation({ summary: 'Parse a legal citation' })
  @ApiResponse({ status: 200, description: 'Parsed citation information' })
  async parseCitation(@Body() body: { citation: string }) {
    return this.citationParserService.parseCitation(body.citation);
  }

  /**
   * Extract citations from text
   */
  @Post('citation/extract')
  @ApiOperation({ summary: 'Extract all citations from text' })
  @ApiResponse({ status: 200, description: 'Extracted citations' })
  async extractCitations(
    @Body() body: { text: string; analyze?: boolean },
    @Req() req: any,
  ) {
    if (body.analyze) {
      const userId = req.user?.id;
      return this.legalResearchService.extractAndAnalyzeCitations(body.text, userId);
    }

    const citations = this.citationParserService.extractCitations(body.text);
    return { citations, total: citations.length };
  }

  /**
   * Get research recommendations
   */
  @Get('recommendations/:type/:id')
  @ApiOperation({ summary: 'Get research recommendations for a case or statute' })
  @ApiResponse({ status: 200, description: 'Research recommendations' })
  async getResearchRecommendations(
    @Param('type') type: 'case_law' | 'statute',
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    return this.legalResearchService.getResearchRecommendations(id, type, limit || 10);
  }

  /**
   * Get user research history
   */
  @Get('history')
  @ApiOperation({ summary: 'Get user research history' })
  @ApiResponse({ status: 200, description: 'Research history' })
  async getResearchHistory(
    @Req() req: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const userId = req.user.id;
    return this.researchHistoryService.getUserResearchHistory(
      userId,
      limit || 50,
      offset || 0,
    );
  }

  /**
   * Get research history statistics
   */
  @Get('history/stats')
  @ApiOperation({ summary: 'Get research history statistics' })
  @ApiResponse({ status: 200, description: 'Research statistics' })
  async getResearchStats(@Req() req: any) {
    const userId = req.user.id;
    return this.researchHistoryService.getResearchHistoryStats(userId);
  }

  /**
   * Get bookmarked queries
   */
  @Get('history/bookmarks')
  @ApiOperation({ summary: 'Get bookmarked research queries' })
  @ApiResponse({ status: 200, description: 'Bookmarked queries' })
  async getBookmarkedQueries(@Req() req: any, @Query('limit') limit?: number) {
    const userId = req.user.id;
    return this.researchHistoryService.getBookmarkedQueries(userId, limit || 50);
  }

  /**
   * Update research query
   */
  @Patch('history/:queryId')
  @ApiOperation({ summary: 'Update research query (notes, bookmarks, tags)' })
  @ApiResponse({ status: 200, description: 'Query updated successfully' })
  async updateResearchQuery(
    @Param('queryId') queryId: string,
    @Body() updateDto: UpdateResearchQueryDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.researchHistoryService.updateResearchQuery(queryId, userId, updateDto);
  }

  /**
   * Delete research query
   */
  @Delete('history/:queryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete research query from history' })
  @ApiResponse({ status: 204, description: 'Query deleted successfully' })
  async deleteResearchQuery(@Param('queryId') queryId: string, @Req() req: any) {
    const userId = req.user.id;
    return this.researchHistoryService.deleteResearchQuery(queryId, userId);
  }

  /**
   * Export research history
   */
  @Get('history/export')
  @ApiOperation({ summary: 'Export research history' })
  @ApiResponse({ status: 200, description: 'Research history export' })
  async exportResearchHistory(@Req() req: any) {
    const userId = req.user.id;
    return this.researchHistoryService.exportResearchHistory(userId);
  }

  /**
   * Get trending research
   */
  @Get('trending')
  @ApiOperation({ summary: 'Get trending cases and statutes' })
  @ApiResponse({ status: 200, description: 'Trending research items' })
  async getTrendingResearch(@Query('limit') limit?: number) {
    return this.legalResearchService.getTrendingResearch(limit || 10);
  }
}
