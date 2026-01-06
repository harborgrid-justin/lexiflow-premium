import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { OperationsService } from "./operations.service";

@ApiTags("Operations")
@Controller("operations")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Get("maintenance")
  @ApiOperation({ summary: "Get maintenance tickets" })
  @ApiResponse({ status: 200, description: "Return all maintenance tickets" })
  async getMaintenanceTickets() {
    return this.operationsService.getMaintenanceTickets();
  }

  @Get("facilities")
  @ApiOperation({ summary: "Get facilities status" })
  @ApiResponse({ status: 200, description: "Return facilities" })
  async getFacilities() {
    return this.operationsService.getFacilities();
  }
}
