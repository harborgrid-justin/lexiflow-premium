import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@ApiTags("Admin - Security")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("admin")
export class SecurityController {
  @Get("security-settings")
  @ApiOperation({ summary: "Get security settings" })
  async getSecuritySettings() {
    return [
      {
        id: "sec1",
        label: "Require MFA",
        desc: "All internal users must use 2-factor authentication.",
        type: "Lock",
        enabled: true,
      },
      {
        id: "sec2",
        label: "Session Timeout",
        desc: "Inactive sessions are logged out after 4 hours.",
        type: "Clock",
        enabled: true,
      },
      {
        id: "sec3",
        label: "IP Whitelisting",
        desc: "Restrict access to specific IP ranges.",
        type: "Globe",
        enabled: false,
      },
    ];
  }
}
