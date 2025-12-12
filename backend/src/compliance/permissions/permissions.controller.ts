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
import { PermissionsService } from './permissions.service';
import {
  GrantPermissionDto,
  RevokePermissionDto,
  QueryPermissionsDto,
  CheckAccessDto,
  AccessMatrixDto,
} from './dto/permission.dto';

@Controller('api/v1/security/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  async findAll(@Query() query: QueryPermissionsDto) {
    return this.permissionsService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async grant(@Body() dto: GrantPermissionDto) {
    return this.permissionsService.grant(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revoke(@Param('id') id: string, @Body() dto: RevokePermissionDto) {
    return this.permissionsService.revoke(id, dto);
  }

  @Post('check-access')
  @HttpCode(HttpStatus.OK)
  async checkAccess(@Body() dto: CheckAccessDto) {
    return this.permissionsService.checkAccess(dto);
  }

  @Post('access-matrix')
  @HttpCode(HttpStatus.OK)
  async getAccessMatrix(@Body() dto: AccessMatrixDto) {
    return this.permissionsService.getAccessMatrix(dto);
  }
}
