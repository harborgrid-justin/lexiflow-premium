import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DiscoveryService } from './discovery.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';

@ApiTags('Discovery')
@ApiBearerAuth('JWT-auth')
@Controller('api/v1/discovery')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get all discovery requests' })
  @ApiResponse({ status: 200, description: 'List of discovery requests' })
  findAll() {
    return this.discoveryService.findAllRequests();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get discovery request by ID' })
  @ApiResponse({ status: 200, description: 'Discovery request details' })
  @ApiResponse({ status: 404, description: 'Discovery request not found' })
  @ApiParam({ name: 'id', description: 'Discovery request ID' })
  findOne(@Param('id') id: string) {
    return this.discoveryService.findRequestById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Create discovery request' })
  @ApiResponse({ status: 201, description: 'Discovery request created' })
  create(@Body() createDto: any) {
    return this.discoveryService.createRequest(createDto);
  }
}
