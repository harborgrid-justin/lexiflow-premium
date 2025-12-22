import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('API Keys')

@Controller('admin/api-keys')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new API key' })
  @ApiResponse({ status: 201, description: 'API key created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(
    @Body() createApiKeyDto: CreateApiKeyDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.apiKeysService.create(createApiKeyDto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List all API keys' })
  @ApiResponse({ status: 200, description: 'List of API keys' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.apiKeysService.findAll(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get API key details' })
  @ApiResponse({ status: 200, description: 'API key details' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.apiKeysService.findOne(id, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke an API key' })
  @ApiResponse({ status: 204, description: 'API key revoked successfully' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async revoke(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.apiKeysService.revoke(id, user.sub);
  }

  @Get(':id/usage')
  @ApiOperation({ summary: 'Get API key usage statistics' })
  @ApiResponse({ status: 200, description: 'Usage statistics' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async getUsageStats(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.apiKeysService.getUsageStats(id, user.sub);
  }

  @Get('scopes')
  @ApiOperation({ summary: 'Get available API key scopes' })
  @ApiResponse({ status: 200, description: 'List of available scopes' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async getAvailableScopes() {
    return this.apiKeysService.getAvailableScopes();
  }
}

