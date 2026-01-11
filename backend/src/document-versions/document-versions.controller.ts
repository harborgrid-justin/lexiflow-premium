import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  Res,
  ParseUUIDPipe,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { Response } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiResponse,
} from "@nestjs/swagger";
import { DocumentVersionsService } from "./document-versions.service";
import { CreateVersionDto } from "./dto/create-version.dto";

@ApiTags("Document Versions")
@ApiBearerAuth("JWT-auth")
@Controller("documents/:documentId/versions")
export class DocumentVersionsController {
  constructor(
    private readonly documentVersionsService: DocumentVersionsService
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Create a new version of a document" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        changeDescription: { type: "string" },
        metadata: { type: "object" },
        caseId: { type: "string" },
        file: {
          type: "string",
          format: "binary",
        },
      },
      required: ["file", "caseId"],
    },
  })
  @ApiResponse({ status: 201, description: "Version created successfully" })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 409, description: "Resource already exists" })
  async createVersion(
    @Param("documentId", ParseUUIDPipe) documentId: string,
    @Body("caseId") caseId: string,
    @Body() createVersionDto: CreateVersionDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return await this.documentVersionsService.createVersion(
      documentId,
      caseId,
      file,
      createVersionDto
    );
  }

  @Get()
  @ApiOperation({ summary: "Get version history of a document" })
  @ApiResponse({
    status: 200,
    description: "Version history retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getVersionHistory(
    @Param("documentId", ParseUUIDPipe) documentId: string
  ) {
    return await this.documentVersionsService.getVersionHistory(documentId);
  }

  @Get(":version")
  @ApiOperation({ summary: "Get a specific version" })
  @ApiResponse({ status: 200, description: "Version found" })
  @ApiResponse({ status: 404, description: "Version not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getVersion(
    @Param("documentId", ParseUUIDPipe) documentId: string,
    @Param("version", ParseIntPipe) version: number
  ) {
    return await this.documentVersionsService.getVersion(documentId, version);
  }

  @Get(":version/download")
  @ApiOperation({ summary: "Download a specific version" })
  @ApiResponse({ status: 200, description: "Version downloaded successfully" })
  @ApiResponse({ status: 404, description: "Version not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async downloadVersion(
    @Param("documentId", ParseUUIDPipe) documentId: string,
    @Param("version", ParseIntPipe) version: number,
    @Res() res: Response
  ): Promise<void> {
    const { buffer, filename, mimeType } =
      await this.documentVersionsService.downloadVersion(documentId, version);

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length.toString());

    res.send(buffer);
  }

  @Get("compare")
  @ApiOperation({ summary: "Compare two versions" })
  @ApiResponse({ status: 200, description: "Comparison completed" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async compareVersions(
    @Param("documentId", ParseUUIDPipe) documentId: string,
    @Query("v1", ParseIntPipe) version1: number,
    @Query("v2", ParseIntPipe) version2: number
  ) {
    return await this.documentVersionsService.compareVersions(
      documentId,
      version1,
      version2
    );
  }

  @Post(":version/restore")
  @ApiOperation({ summary: "Restore a specific version" })
  @ApiResponse({ status: 201, description: "Version restored successfully" })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 409, description: "Resource already exists" })
  async restoreVersion(
    @Param("documentId", ParseUUIDPipe) documentId: string,
    @Param("version", ParseIntPipe) version: number
  ) {
    return await this.documentVersionsService.restoreVersion(
      documentId,
      version
    );
  }
}
