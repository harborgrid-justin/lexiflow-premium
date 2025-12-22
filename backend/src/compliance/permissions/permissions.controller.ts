import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, _ApiOperation , ApiResponse }from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import {
  GrantPermissionDto,
  RevokePermissionDto,
  QueryPermissionsDto,
  CheckAccessDto,
  AccessMatrixDto,
} from './dto/permission.dto';

@ApiTags('Security - Permissions')
@ApiBearerAuth('JWT-auth')

@Controller('security/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() query: QueryPermissionsDto) {
    return this.permissionsService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async grant(@Body() dto: GrantPermissionDto) {
    return this.permissionsService.grant(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async revoke(@Param('id') id: string, @Body() dto: RevokePermissionDto) {
    return this.permissionsService.revoke(id, dto);
  }

  @Post('check-access')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async checkAccess(@Body() dto: CheckAccessDto) {
    return this.permissionsService.checkAccess(dto);
  }

  @Post('access-matrix')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async getAccessMatrix(@Body() dto: AccessMatrixDto) {
    return this.permissionsService.getAccessMatrix(dto);
  }
}

