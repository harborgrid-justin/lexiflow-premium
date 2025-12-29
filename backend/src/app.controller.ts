import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';

import { AppService } from './app.service';

/* ------------------------------------------------------------------ */
/* Root / Health / Version Controller                                  */
/* ------------------------------------------------------------------ */

@ApiTags('system')
@Controller({ version: VERSION_NEUTRAL })
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}

  /* ------------------------------------------------------------------ */
  /* Root                                                               */
  /* ------------------------------------------------------------------ */

  @Get()
  @ApiOperation({
    summary: 'Root endpoint',
    description: 'Provides basic service metadata and entrypoint links',
  })
  @ApiResponse({
    status: 200,
    description: 'Service metadata returned successfully',
  })
  getRoot() {
    return this.appService.getRoot();
  }

  /* ------------------------------------------------------------------ */
  /* Health                                                             */
  /* ------------------------------------------------------------------ */

  @Public()
  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns liveness and dependency health information',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy or degraded',
  })
  getHealth() {
    return this.appService.getHealth();
  }

  /* ------------------------------------------------------------------ */
  /* Version                                                            */
  /* ------------------------------------------------------------------ */

  @Get('version')
  @ApiOperation({
    summary: 'Version information',
    description: 'Returns build, runtime, and API version details',
  })
  @ApiResponse({
    status: 200,
    description: 'Version information returned successfully',
  })
  getVersion() {
    return this.appService.getVersion();
  }
}
