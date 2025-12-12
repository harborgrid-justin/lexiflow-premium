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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';
// import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('API Keys')
@Controller('api/v1/admin/api-keys')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('ADMIN')
@ApiBearerAuth()
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new API key' })
  @ApiResponse({ status: 201, description: 'API key created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async create(
    @Body() createApiKeyDto: CreateApiKeyDto,
    // @CurrentUser() user: any,
  ) {
    // TODO: Uncomment when auth is implemented
    const userId = 'temp-admin-id'; // user.id
    return this.apiKeysService.create(createApiKeyDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all API keys' })
  @ApiResponse({ status: 200, description: 'List of API keys' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async findAll(
    // @CurrentUser() user: any,
  ) {
    // TODO: Uncomment when auth is implemented
    const userId = 'temp-admin-id'; // user.id
    return this.apiKeysService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get API key details' })
  @ApiResponse({ status: 200, description: 'API key details' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async findOne(
    @Param('id') id: string,
    // @CurrentUser() user: any,
  ) {
    // TODO: Uncomment when auth is implemented
    const userId = 'temp-admin-id'; // user.id
    return this.apiKeysService.findOne(id, userId);
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
    // @CurrentUser() user: any,
  ) {
    // TODO: Uncomment when auth is implemented
    const userId = 'temp-admin-id'; // user.id
    await this.apiKeysService.revoke(id, userId);
  }

  @Get(':id/usage')
  @ApiOperation({ summary: 'Get API key usage statistics' })
  @ApiResponse({ status: 200, description: 'Usage statistics' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async getUsageStats(
    @Param('id') id: string,
    // @CurrentUser() user: any,
  ) {
    // TODO: Uncomment when auth is implemented
    const userId = 'temp-admin-id'; // user.id
    return this.apiKeysService.getUsageStats(id, userId);
  }
}
