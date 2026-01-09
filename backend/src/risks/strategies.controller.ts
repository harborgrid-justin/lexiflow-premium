import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@ApiTags("Strategies")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("strategies")
export class StrategiesController {
  @Get()
  @ApiOperation({ summary: "Get all strategies" })
  async getStrategies(@Query("caseId") caseId?: string) {
    // Stub implementation
    return [
      {
        id: "1",
        caseId: caseId || "123",
        name: "Initial Defense Strategy",
        description:
          "Focus on procedural dismissal due to lack of jurisdiction.",
        objectives: ["Dismiss case", "Minimize discovery"],
        risks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  @Get(":id")
  @ApiOperation({ summary: "Get strategy by ID" })
  async getById(@Param("id") id: string) {
    return {
      id,
      caseId: "123",
      name: "Initial Defense Strategy",
      description: "Focus on procedural dismissal due to lack of jurisdiction.",
      objectives: ["Dismiss case", "Minimize discovery"],
      risks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  @Post()
  @ApiOperation({ summary: "Create new strategy" })
  async create(@Body() strategy: any) {
    return {
      id: Math.random().toString(36).substring(7),
      ...strategy,
      createdAt: new Date().toISOString(),
    };
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update strategy" })
  async update(@Param("id") id: string, @Body() updates: any) {
    return {
      id,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete strategy" })
  async delete(@Param("id") id: string) {
    return { success: true, id };
  }

  @Get("recommendations")
  @ApiOperation({ summary: "Get Recommendations" })
  async getRecommendations(@Query("caseId") caseId: string) {
    return [
      {
        id: "1",
        caseId,
        type: "motion",
        title: "File Motion to Dismiss",
        description: "Based on lack of personal jurisdiction",
        priority: 1,
        rationale: "Plaintiff failed to establish minimum contacts",
      },
    ];
  }

  @Get(":id/risks")
  @ApiOperation({ summary: "Analyze Risks" })
  async analyzeRisks(@Param("id") id: string) {
    return [
      {
        id: "1",
        strategyId: id,
        description: "Judge has history of denying similar motions",
        severity: "High",
        probability: 0.7,
        mitigation: "Cite recent appellate decisions overturning denials",
      },
    ];
  }
}
