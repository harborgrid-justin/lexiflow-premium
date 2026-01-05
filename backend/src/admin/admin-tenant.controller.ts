import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  Head,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  AdminTenantService,
  TenantConfigResponse,
  UpdateTenantConfigDto,
} from "./admin-tenant.service";

@ApiTags("Admin - Tenant")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("admin/tenant")
export class AdminTenantController {
  constructor(private readonly adminTenantService: AdminTenantService) {}

  @Head("config")
  @HttpCode(HttpStatus.OK)
  async healthCheck(): Promise<void> {
    return;
  }

  @Get("config")
  @ApiOperation({ summary: "Get tenant configuration" })
  @ApiResponse({
    status: 200,
    description: "Tenant configuration retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getTenantConfig(
    @Query("tenantId") tenantId?: string
  ): Promise<TenantConfigResponse> {
    return await this.adminTenantService.getTenantConfig(tenantId);
  }

  @Get("all")
  @ApiOperation({ summary: "Get all tenant configurations" })
  @ApiResponse({
    status: 200,
    description: "All tenant configurations retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getAllTenants(): Promise<TenantConfigResponse[]> {
    return await this.adminTenantService.getAllTenants();
  }

  @Put("config/:tenantId")
  @ApiOperation({ summary: "Update tenant configuration" })
  @ApiResponse({
    status: 200,
    description: "Tenant configuration updated successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async updateTenantConfig(
    @Param("tenantId") tenantId: string,
    @Body() updateDto: UpdateTenantConfigDto
  ): Promise<TenantConfigResponse> {
    return await this.adminTenantService.updateTenantConfig(tenantId, updateDto);
  }

  @Delete("config/:tenantId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Deactivate tenant" })
  @ApiResponse({
    status: 204,
    description: "Tenant deactivated successfully",
  })
  @ApiResponse({ status: 404, description: "Tenant not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async deactivateTenant(@Param("tenantId") tenantId: string): Promise<void> {
    await this.adminTenantService.deactivateTenant(tenantId);
  }
}
