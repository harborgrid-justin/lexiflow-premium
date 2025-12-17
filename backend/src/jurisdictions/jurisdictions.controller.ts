import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JurisdictionsService } from './jurisdictions.service';
import { CreateJurisdictionDto } from './dto/create-jurisdiction.dto';
import { UpdateJurisdictionDto } from './dto/update-jurisdiction.dto';
import { CreateJurisdictionRuleDto } from './dto/create-jurisdiction-rule.dto';
import { UpdateJurisdictionRuleDto } from './dto/update-jurisdiction-rule.dto';
import { JurisdictionSystem } from './entities/jurisdiction.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Jurisdictions')
@ApiBearerAuth('JWT-auth')
@Public() // Allow public access for development
@Controller('jurisdictions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JurisdictionsController {
  constructor(private readonly jurisdictionsService: JurisdictionsService) {}

  // ============================================================================
  // JURISDICTIONS
  // ============================================================================

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new jurisdiction' })
  @ApiResponse({ status: 201, description: 'Jurisdiction created' })
  async create(@Body() createDto: CreateJurisdictionDto) {
    return this.jurisdictionsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all jurisdictions' })
  @ApiResponse({ status: 200, description: 'List of jurisdictions' })
  @ApiQuery({ name: 'system', enum: JurisdictionSystem, required: false })
  @ApiQuery({ name: 'search', required: false, description: 'Search query' })
  async findAll(
    @Query('system') system?: JurisdictionSystem,
    @Query('search') search?: string
  ) {
    if (search) {
      return this.jurisdictionsService.search(search);
    }
    if (system) {
      return this.jurisdictionsService.findBySystem(system);
    }
    return this.jurisdictionsService.findAll();
  }

  @Get('federal')
  @ApiOperation({ summary: 'Get federal courts' })
  @ApiResponse({ status: 200, description: 'List of federal jurisdictions' })
  async getFederal() {
    return this.jurisdictionsService.getFederalCourts();
  }

  @Get('state')
  @ApiOperation({ summary: 'Get state courts' })
  @ApiResponse({ status: 200, description: 'List of state jurisdictions' })
  async getState() {
    return this.jurisdictionsService.getStateCourts();
  }

  @Get('regulatory')
  @ApiOperation({ summary: 'Get regulatory bodies' })
  @ApiResponse({ status: 200, description: 'List of regulatory jurisdictions' })
  async getRegulatory() {
    return this.jurisdictionsService.getRegulatoryBodies();
  }

  @Get('international')
  @ApiOperation({ summary: 'Get international treaties' })
  @ApiResponse({ status: 200, description: 'List of international jurisdictions' })
  async getInternational() {
    return this.jurisdictionsService.getInternationalTreaties();
  }

  @Get('arbitration')
  @ApiOperation({ summary: 'Get arbitration providers' })
  @ApiResponse({ status: 200, description: 'List of arbitration providers' })
  async getArbitration() {
    return this.jurisdictionsService.getArbitrationProviders();
  }

  @Get('local')
  @ApiOperation({ summary: 'Get local court rules' })
  @ApiResponse({ status: 200, description: 'List of local jurisdictions' })
  async getLocal() {
    return this.jurisdictionsService.getLocalRules();
  }

  @Get('map-nodes')
  @ApiOperation({ summary: 'Get jurisdiction map visualization data' })
  @ApiResponse({ status: 200, description: 'Map node data for visualization' })
  async getMapNodes() {
    return this.jurisdictionsService.getMapNodes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get jurisdiction by ID' })
  @ApiResponse({ status: 200, description: 'Jurisdiction details' })
  @ApiResponse({ status: 404, description: 'Jurisdiction not found' })
  @ApiParam({ name: 'id', description: 'Jurisdiction ID' })
  async findOne(@Param('id') id: string) {
    return this.jurisdictionsService.findById(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update jurisdiction' })
  @ApiResponse({ status: 200, description: 'Jurisdiction updated' })
  @ApiResponse({ status: 404, description: 'Jurisdiction not found' })
  @ApiParam({ name: 'id', description: 'Jurisdiction ID' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateJurisdictionDto) {
    return this.jurisdictionsService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete jurisdiction' })
  @ApiResponse({ status: 200, description: 'Jurisdiction deleted' })
  @ApiResponse({ status: 404, description: 'Jurisdiction not found' })
  @ApiParam({ name: 'id', description: 'Jurisdiction ID' })
  async remove(@Param('id') id: string) {
    await this.jurisdictionsService.remove(id);
    return { message: 'Jurisdiction deleted successfully' };
  }

  // ============================================================================
  // RULES
  // ============================================================================

  @Post('rules')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new jurisdiction rule' })
  @ApiResponse({ status: 201, description: 'Rule created' })
  async createRule(@Body() createDto: CreateJurisdictionRuleDto) {
    return this.jurisdictionsService.createRule(createDto);
  }

  @Get('rules/search')
  @ApiOperation({ summary: 'Search jurisdiction rules' })
  @ApiResponse({ status: 200, description: 'List of matching rules' })
  @ApiQuery({ name: 'q', description: 'Search query for code, name, or type' })
  @ApiQuery({ name: 'jurisdictionId', required: false, description: 'Filter by jurisdiction' })
  async searchRules(
    @Query('q') query: string,
    @Query('jurisdictionId') jurisdictionId?: string
  ) {
    return this.jurisdictionsService.searchRules(query, jurisdictionId);
  }

  @Get('rules/:id')
  @ApiOperation({ summary: 'Get rule by ID' })
  @ApiResponse({ status: 200, description: 'Rule details' })
  @ApiResponse({ status: 404, description: 'Rule not found' })
  @ApiParam({ name: 'id', description: 'Rule ID' })
  async findRule(@Param('id') id: string) {
    return this.jurisdictionsService.findRuleById(id);
  }

  @Get(':jurisdictionId/rules')
  @ApiOperation({ summary: 'Get all rules for a jurisdiction' })
  @ApiResponse({ status: 200, description: 'List of rules' })
  @ApiParam({ name: 'jurisdictionId', description: 'Jurisdiction ID' })
  async findJurisdictionRules(@Param('jurisdictionId') jurisdictionId: string) {
    return this.jurisdictionsService.findAllRules(jurisdictionId);
  }

  @Put('rules/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update jurisdiction rule' })
  @ApiResponse({ status: 200, description: 'Rule updated' })
  @ApiResponse({ status: 404, description: 'Rule not found' })
  @ApiParam({ name: 'id', description: 'Rule ID' })
  async updateRule(@Param('id') id: string, @Body() updateDto: UpdateJurisdictionRuleDto) {
    return this.jurisdictionsService.updateRule(id, updateDto);
  }

  @Delete('rules/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete jurisdiction rule' })
  @ApiResponse({ status: 200, description: 'Rule deleted' })
  @ApiResponse({ status: 404, description: 'Rule not found' })
  @ApiParam({ name: 'id', description: 'Rule ID' })
  async removeRule(@Param('id') id: string) {
    await this.jurisdictionsService.removeRule(id);
    return { message: 'Rule deleted successfully' };
  }
}
