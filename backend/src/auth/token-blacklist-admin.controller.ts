import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
 }from '@nestjs/swagger';
import { JwtAuthGuard } from './guards';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { TokenBlacklistService } from './token-blacklist.service';
import { TokenBlacklistCleanupService } from './token-blacklist-cleanup.service';

/**
 * Admin endpoints for token blacklist management
 * Only accessible by SUPER_ADMIN and ADMINISTRATOR roles
 */
@ApiTags('Admin - Token Blacklist')
@ApiBearerAuth('JWT-auth')

@Controller('admin/blacklist')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMINISTRATOR)
export class TokenBlacklistAdminController {
  constructor(
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly cleanupService: TokenBlacklistCleanupService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get token blacklist statistics' })
  @ApiResponse({
    status: 200,
    description: 'Blacklist statistics retrieved successfully',
    schema: {
      example: {
        storage: 'redis',
        size: 1250,
        useRedis: true,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getStats() {
    const stats = await this.tokenBlacklistService.getStats();
    return {
      message: 'Blacklist statistics retrieved successfully',
      data: stats,
    };
  }

  @Post('cleanup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Manually trigger blacklist cleanup',
    description: 'Removes expired entries from in-memory blacklist. Redis handles cleanup automatically.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cleanup completed successfully',
    schema: {
      example: {
        message: 'Cleanup completed successfully',
        data: {
          cleanedCount: 42,
          stats: {
            storage: 'memory',
            size: 108,
            useRedis: false,
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async triggerCleanup() {
    const result = await this.cleanupService.triggerManualCleanup();
    return {
      message: 'Cleanup completed successfully',
      data: result,
    };
  }

  @Post('user/:userId/revoke')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke all tokens for a specific user',
    description: 'Blacklists all tokens for the specified user. Use for security incidents or forced logout.',
  })
  @ApiResponse({
    status: 200,
    description: 'All user tokens revoked successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async revokeUserTokens(@Param('userId') userId: string) {
    await this.tokenBlacklistService.blacklistUserTokens(userId);
    return {
      message: `All tokens for user ${userId} have been revoked`,
      userId,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('token/revoke')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Blacklist a specific token by JTI',
    description: 'Manually blacklist a specific token. Requires JTI and expiration date.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['jti', 'expiresAt'],
      properties: {
        jti: {
          type: 'string',
          description: 'JWT ID (unique token identifier)',
          example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        },
        expiresAt: {
          type: 'string',
          format: 'date-time',
          description: 'Token expiration date (ISO 8601)',
          example: '2024-12-31T23:59:59Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token blacklisted successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid JTI or expiration date' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async blacklistToken(@Body() body: { jti: string; expiresAt: string }) {
    const expiresAt = new Date(body.expiresAt);

    if (isNaN(expiresAt.getTime())) {
      return {
        statusCode: 400,
        message: 'Invalid expiration date format',
      };
    }

    await this.tokenBlacklistService.blacklistToken(body.jti, expiresAt);

    return {
      message: 'Token blacklisted successfully',
      jti: body.jti,
      expiresAt: expiresAt.toISOString(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('token/:jti/status')
  @ApiOperation({
    summary: 'Check if a specific token is blacklisted',
    description: 'Query the blacklist status of a token by its JTI',
  })
  @ApiResponse({
    status: 200,
    description: 'Token status retrieved successfully',
    schema: {
      example: {
        jti: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        isBlacklisted: true,
        checkedAt: '2024-12-16T12:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async checkTokenStatus(@Param('jti') jti: string) {
    const isBlacklisted = await this.tokenBlacklistService.isBlacklisted(jti);

    return {
      jti,
      isBlacklisted,
      checkedAt: new Date().toISOString(),
    };
  }
}

