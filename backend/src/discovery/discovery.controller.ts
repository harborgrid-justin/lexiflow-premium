import { Controller, Get, Post, Body, Param, Query, Head, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam , ApiResponse} from '@nestjs/swagger';
import { DiscoveryService } from './discovery.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Discovery')
@ApiBearerAuth('JWT-auth')

@Controller('discovery')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Head()
  @HttpCode(HttpStatus.OK)
  async health() {
    return;
  }

  @Head('evidence')
  @HttpCode(HttpStatus.OK)
  async evidenceHealth() {
    return;
  }

  @Get('evidence')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get all discovery evidence items' })
  @ApiResponse({ status: 200, description: 'List of evidence items' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAllEvidence(@Query() query?: any) {
    return this.discoveryService.getAllEvidence(query);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get all discovery requests' })
  @ApiResponse({ status: 200, description: 'List of discovery requests' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll(@Query() query?: any) {
    return this.discoveryService.findAllRequests();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get discovery request by ID' })
  @ApiResponse({ status: 200, description: 'Discovery request details' })
  @ApiResponse({ status: 404, description: 'Discovery request not found' })
  @ApiParam({ name: 'id', description: 'Discovery request ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findOne(@Param('id') id: string) {
    return this.discoveryService.findRequestById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Create discovery request' })
  @ApiResponse({ status: 201, description: 'Discovery request created' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  create(@Body() createDto: any) {
    return this.discoveryService.createRequest(createDto);
  }
}

