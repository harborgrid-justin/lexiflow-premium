import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { Public } from '@common/decorators/public.decorator';
import { JwtAuthGuard } from '@auth/guards';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { SamlService } from './saml.service';
import {
  SamlLoginDto,
  SamlCallbackDto,
  CreateSamlConfigDto,
  UpdateSamlConfigDto,
} from './dto/saml-login.dto';

/**
 * SAML SSO Controller
 * Handles SAML 2.0 authentication flows and configuration
 */
@ApiTags('Authentication - SSO')
@Controller('auth/saml')
export class SamlController {
  constructor(private readonly samlService: SamlService) {}

  /**
   * Initiate SAML SSO login
   * Redirects user to IdP login page
   */
  @Public()
  @Get('login/:organizationId')
  @ApiOperation({ summary: 'Initiate SAML SSO login' })
  @ApiResponse({ status: 302, description: 'Redirect to IdP login page' })
  @ApiResponse({ status: 404, description: 'SAML configuration not found' })
  async initiateLogin(
    @Param('organizationId') organizationId: string,
    @Query('relayState') relayState: string,
    @Res() res: Response,
  ) {
    const { redirectUrl } = await this.samlService.generateAuthRequest(
      organizationId,
      relayState,
    );
    return res.redirect(redirectUrl);
  }

  /**
   * SAML SSO callback endpoint
   * Handles SAML response from IdP
   */
  @Public()
  @Post('callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle SAML callback from IdP' })
  @ApiResponse({
    status: 200,
    description: 'SAML authentication successful, returns JWT tokens',
  })
  @ApiResponse({ status: 401, description: 'Invalid SAML response' })
  async handleCallback(
    @Body('SAMLResponse') samlResponse: string,
    @Body('RelayState') relayState: string,
    @Req() req: Request,
  ) {
    if (!samlResponse) {
      throw new Error('SAMLResponse is required');
    }

    const result = await this.samlService.handleSamlResponse(
      samlResponse,
      relayState,
    );

    return {
      message: 'SAML authentication successful',
      ...result,
      relayState,
    };
  }

  /**
   * Get SAML metadata for Service Provider
   */
  @Public()
  @Get('metadata/:organizationId')
  @ApiOperation({ summary: 'Get SAML SP metadata' })
  @ApiResponse({
    status: 200,
    description: 'Returns SAML metadata XML',
    content: { 'application/xml': {} },
  })
  async getMetadata(
    @Param('organizationId') organizationId: string,
    @Res() res: Response,
  ) {
    const metadata = await this.samlService.getServiceProviderMetadata(
      organizationId,
    );
    res.set('Content-Type', 'application/xml');
    return res.send(metadata);
  }

  /**
   * Initiate SAML logout
   */
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate SAML logout' })
  @ApiResponse({ status: 200, description: 'Returns logout redirect URL' })
  async initiateLogout(@CurrentUser('id') userId: string) {
    return this.samlService.initiateLogout(userId);
  }

  /**
   * Handle SAML logout response
   */
  @Public()
  @Post('logout/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle SAML logout response' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async handleLogoutCallback(
    @Body('SAMLResponse') logoutResponse: string,
  ) {
    await this.samlService.handleLogoutResponse(logoutResponse);
    return { message: 'Logout successful' };
  }

  /**
   * Create SAML configuration (Admin only)
   */
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('config')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create SAML configuration' })
  @ApiResponse({ status: 201, description: 'Configuration created' })
  @ApiResponse({ status: 400, description: 'Configuration already exists' })
  async createConfig(@Body() dto: CreateSamlConfigDto) {
    return this.samlService.createSamlConfig(dto);
  }

  /**
   * Get SAML configuration
   */
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('config/:organizationId')
  @ApiOperation({ summary: 'Get SAML configuration' })
  @ApiResponse({ status: 200, description: 'Configuration retrieved' })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  async getConfig(@Param('organizationId') organizationId: string) {
    return this.samlService.getSamlConfig(organizationId);
  }

  /**
   * Update SAML configuration
   */
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('config/:organizationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update SAML configuration' })
  @ApiResponse({ status: 200, description: 'Configuration updated' })
  async updateConfig(
    @Param('organizationId') organizationId: string,
    @Body() dto: UpdateSamlConfigDto,
  ) {
    return this.samlService.updateSamlConfig(organizationId, dto);
  }

  /**
   * Delete SAML configuration
   */
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('config/:organizationId/delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete SAML configuration' })
  @ApiResponse({ status: 200, description: 'Configuration deleted' })
  async deleteConfig(@Param('organizationId') organizationId: string) {
    await this.samlService.deleteSamlConfig(organizationId);
    return { message: 'Configuration deleted successfully' };
  }

  /**
   * Get user's active SAML sessions
   */
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  @ApiOperation({ summary: 'Get active SAML sessions' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved' })
  async getSessions(@CurrentUser('id') userId: string) {
    return this.samlService.getUserSamlSessions(userId);
  }

  /**
   * Revoke SAML session
   */
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('sessions/:sessionId/revoke')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke SAML session' })
  @ApiResponse({ status: 200, description: 'Session revoked' })
  async revokeSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.samlService.revokeSamlSession(sessionId, userId);
    return { message: 'Session revoked successfully' };
  }
}
