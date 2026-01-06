import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ResearchService } from "./research.service";

@ApiTags("Legal Research")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("research")
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Get("history")
  @ApiOperation({ summary: "Get research history" })
  @ApiResponse({ status: 200, description: "Return list of recent searches" })
  async getHistory() {
    return this.researchService.getHistory();
  }

  @Get("cases")
  @ApiOperation({ summary: "Search case law" })
  async searchCases(@Query("q") query: string) {
    return this.researchService.searchCases(query || "");
  }

  @Get("statutes")
  @ApiOperation({ summary: "Search statutes" })
  async searchStatutes(@Query("q") query: string) {
    return this.researchService.searchStatutes(query || "");
  }

  @Post("validate-citation")
  @ApiOperation({ summary: "Validate a legal citation" })
  async validateCitation(@Body("citation") citation: string) {
    return this.researchService.validateCitation(citation);
  }

  @Get("related-cases/:caseId")
  @ApiOperation({ summary: "Get related cases" })
  async getRelatedCases(@Param("caseId") caseId: string) {
    return this.researchService.getRelatedCases(caseId);
  }

  @Get("citations/:documentId")
  @ApiOperation({ summary: "Get citations from a document" })
  async getCitations(@Param("documentId") documentId: string) {
    return this.researchService.getCitations(documentId);
  }
}
