import { Public } from "@common/decorators/public.decorator";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { RequestWithUser } from "@common/interfaces/request-with-user.interface";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { DraftingService } from "./drafting.service";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { GenerateDocumentDto } from "./dto/generate-document.dto";
import { UpdateGeneratedDocumentDto } from "./dto/update-generated-document.dto";
import { UpdateTemplateDto } from "./dto/update-template.dto";

@ApiTags("drafting")
@Controller("drafting")
@UseGuards(JwtAuthGuard)
export class DraftingController {
  constructor(private readonly draftingService: DraftingService) {}

  // ============================================================================
  // DASHBOARD ENDPOINTS
  // ============================================================================

  @Public()
  @Get("recent-drafts")
  @ApiOperation({ summary: "Get recent drafts for the current user" })
  async getRecentDrafts(
    @Request() req: RequestWithUser,
    @Query("limit") limit: number = 5
  ) {
    const userId = req.user?.id || "00000000-0000-0000-0000-000000000001";
    return this.draftingService.getRecentDrafts(userId, limit);
  }

  @Public()
  @Get("templates")
  @ApiOperation({ summary: "Get available document templates" })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "category", required: false })
  @ApiQuery({ name: "jurisdiction", required: false })
  @ApiQuery({ name: "practiceArea", required: false })
  @ApiQuery({ name: "search", required: false })
  async getTemplates(
    @Query("limit") limit: number = 10,
    @Query("category") category?: string,
    @Query("jurisdiction") jurisdiction?: string,
    @Query("practiceArea") practiceArea?: string,
    @Query("search") search?: string
  ) {
    if (category || jurisdiction || practiceArea || search) {
      return this.draftingService.getAllTemplates(
        category,
        jurisdiction,
        practiceArea,
        search
      );
    }
    return this.draftingService.getTemplates(limit);
  }

  @Public()
  @Get("approvals")
  @ApiOperation({
    summary: "Get documents pending approval for the current user",
  })
  async getPendingApprovals(@Request() req: RequestWithUser) {
    const userId = req.user?.id || "00000000-0000-0000-0000-000000000001";
    return this.draftingService.getPendingApprovals(userId);
  }

  @Public()
  @Get("stats")
  @ApiOperation({
    summary: "Get drafting dashboard statistics for the current user",
  })
  async getStats(@Request() req: RequestWithUser) {
    const userId = req.user?.id || "00000000-0000-0000-0000-000000000001";
    return this.draftingService.getStats(userId);
  }

  // ============================================================================
  // TEMPLATE CRUD ENDPOINTS
  // ============================================================================

  @Public()
  @Post("templates")
  @ApiOperation({ summary: "Create a new template" })
  @ApiResponse({ status: 201, description: "Template created successfully" })
  async createTemplate(
    @Body() dto: CreateTemplateDto,
    @Request() req: RequestWithUser
  ) {
    const userId = req.user?.id || "00000000-0000-0000-0000-000000000001";
    return this.draftingService.createTemplate(dto, userId);
  }

  @Public()
  @Get("templates/all")
  @ApiOperation({ summary: "Get all templates with filters" })
  async getAllTemplates(
    @Query("category") category?: string,
    @Query("jurisdiction") jurisdiction?: string,
    @Query("practiceArea") practiceArea?: string,
    @Query("search") search?: string
  ) {
    return this.draftingService.getAllTemplates(
      category,
      jurisdiction,
      practiceArea,
      search
    );
  }

  @Public()
  @Get("templates/:id")
  @ApiOperation({ summary: "Get template by ID" })
  async getTemplateById(@Param("id", ParseUUIDPipe) id: string) {
    return this.draftingService.getTemplateById(id);
  }

  @Public()
  @Put("templates/:id")
  @ApiOperation({ summary: "Update template" })
  async updateTemplate(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateTemplateDto,
    @Request() req: RequestWithUser
  ) {
    const userId = req.user?.id || "00000000-0000-0000-0000-000000000001";
    return this.draftingService.updateTemplate(id, dto, userId);
  }

  @Public()
  @Delete("templates/:id")
  @ApiOperation({ summary: "Delete template" })
  async deleteTemplate(@Param("id", ParseUUIDPipe) id: string) {
    await this.draftingService.deleteTemplate(id);
    return { message: "Template deleted successfully" };
  }

  @Public()
  @Post("templates/:id/archive")
  @ApiOperation({ summary: "Archive template" })
  async archiveTemplate(
    @Param("id", ParseUUIDPipe) id: string,
    @Request() req: RequestWithUser
  ) {
    const userId = req.user?.id || "00000000-0000-0000-0000-000000000001";
    return this.draftingService.archiveTemplate(id, userId);
  }

  @Public()
  @Post("templates/:id/duplicate")
  @ApiOperation({ summary: "Duplicate template" })
  async duplicateTemplate(
    @Param("id", ParseUUIDPipe) id: string,
    @Request() req: RequestWithUser
  ) {
    const userId = req.user?.id || "00000000-0000-0000-0000-000000000001";
    return this.draftingService.duplicateTemplate(id, userId);
  }

  // ============================================================================
  // DOCUMENT GENERATION ENDPOINTS
  // ============================================================================

  @Public()
  @Post("generate")
  @ApiOperation({ summary: "Generate document from template" })
  @ApiResponse({ status: 201, description: "Document generated successfully" })
  async generateDocument(
    @Body() dto: GenerateDocumentDto,
    @Request() req: RequestWithUser
  ) {
    const userId = req.user?.id || "00000000-0000-0000-0000-000000000001";
    return this.draftingService.generateDocument(dto, userId);
  }

  @Public()
  @Post("documents/preview")
  @ApiOperation({ summary: "Generate preview of document without saving" })
  @ApiResponse({ status: 200, description: "Preview generated successfully" })
  async generatePreview(
    @Body() dto: GenerateDocumentDto,
    @Request() req: RequestWithUser
  ) {
    const userId = req.user?.id || "00000000-0000-0000-0000-000000000001";
    return this.draftingService.generatePreview(dto, userId);
  }

  @Public()
  @Get("documents")
  @ApiOperation({ summary: "Get all generated documents" })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "caseId", required: false })
  async getAllGeneratedDocuments(
    @Request() req: RequestWithUser,
    @Query("status") status?: string,
    @Query("caseId") caseId?: string
  ) {
    const userId = req.user?.id || "00000000-0000-0000-0000-000000000001";
    return this.draftingService.getAllGeneratedDocuments(
      userId,
      status as GeneratedDocumentStatus,
      caseId
    );
  }

  @Public()
  @Get("documents/:id")
  @ApiOperation({ summary: "Get generated document by ID" })
  async getGeneratedDocumentById(@Param("id", ParseUUIDPipe) id: string) {
    return this.draftingService.getGeneratedDocumentById(id);
  }

  @Public()
  @Put("documents/:id")
  @ApiOperation({ summary: "Update generated document" })
  async updateGeneratedDocument(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateGeneratedDocumentDto,
    @Request() req: RequestWithUser
  ) {
    const userId = req.user?.id || "00000000-0000-0000-0000-000000000001";
    return this.draftingService.updateGeneratedDocument(id, dto, userId);
  }

  @Public()
  @Post("documents/:id/submit")
  @ApiOperation({ summary: "Submit document for review" })
  async submitForReview(
    @Param("id", ParseUUIDPipe) id: string,
    @Request() req: RequestWithUser
  ) {
    const userId = req.user?.id || "00000000-0000-0000-0000-000000000001";
    return this.draftingService.submitForReview(id, userId);
  }

  @Public()
  @Post("documents/:id/approve")
  @ApiOperation({ summary: "Approve document" })
  async approveDocument(
    @Param("id", ParseUUIDPipe) id: string,
    @Body("notes") notes: string,
    @Request() req: RequestWithUser
  ) {
    const userId = req.user?.id || "00000000-0000-0000-0000-000000000001";
    return this.draftingService.approveDocument(id, userId, notes);
  }

  @Public()
  @Post("documents/:id/reject")
  @ApiOperation({ summary: "Reject document" })
  async rejectDocument(
    @Param("id", ParseUUIDPipe) id: string,
    @Body("notes") notes: string,
    @Request() req: RequestWithUser
  ) {
    const userId = req.user?.id || "00000000-0000-0000-0000-000000000001";
    return this.draftingService.rejectDocument(id, userId, notes);
  }

  @Public()
  @Post("documents/:id/finalize")
  @ApiOperation({ summary: "Finalize approved document" })
  async finalizeDocument(
    @Param("id", ParseUUIDPipe) id: string,
    @Request() req: RequestWithUser
  ) {
    const userId = req.user?.id || "00000000-0000-0000-0000-000000000001";
    return this.draftingService.finalizeDocument(id, userId);
  }

  @Public()
  @Delete("documents/:id")
  @ApiOperation({ summary: "Delete generated document" })
  async deleteGeneratedDocument(@Param("id", ParseUUIDPipe) id: string) {
    await this.draftingService.deleteGeneratedDocument(id);
    return { message: "Document deleted successfully" };
  }
}
