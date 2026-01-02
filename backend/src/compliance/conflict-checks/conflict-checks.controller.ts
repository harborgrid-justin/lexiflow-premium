import { Public } from "@common/decorators/public.decorator";
import {
  Body,
  Controller,
  Get,
  Head,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ConflictChecksService } from "./conflict-checks.service";
import {
  QueryConflictChecksDto,
  ResolveConflictDto,
  RunConflictCheckDto,
  WaiveConflictDto,
} from "./dto/conflict-check.dto";

@ApiTags("Compliance - Conflict Checks")
@ApiBearerAuth("JWT-auth")
@Controller("compliance/conflicts")
export class ConflictChecksController {
  constructor(private readonly conflictChecksService: ConflictChecksService) {}

  @Public()
  @Head()
  @HttpCode(HttpStatus.OK)
  async health() {
    return;
  }

  @Public() // TODO: Remove in production - add proper auth
  @Get()
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findAll(@Query() query: QueryConflictChecksDto) {
    return this.conflictChecksService.findAll(query);
  }

  @Post("check")
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 409, description: "Resource already exists" })
  async runCheck(@Body() dto: RunConflictCheckDto) {
    return this.conflictChecksService.runCheck(dto);
  }

  @Public() // TODO: Remove in production - add proper auth
  @Get(":id")
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Resource not found" })
  async findOne(@Param("id") id: string) {
    return this.conflictChecksService.findOne(id);
  }

  @Post(":id/resolve")
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Resource not found" })
  @ApiResponse({ status: 409, description: "Resource already exists" })
  async resolve(@Param("id") id: string, @Body() dto: ResolveConflictDto) {
    return this.conflictChecksService.resolve(id, dto);
  }

  @Post(":id/waive")
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 400, description: "Invalid request data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Resource not found" })
  @ApiResponse({ status: 409, description: "Resource already exists" })
  async waive(@Param("id") id: string, @Body() dto: WaiveConflictDto) {
    return this.conflictChecksService.waive(id, dto);
  }
}
