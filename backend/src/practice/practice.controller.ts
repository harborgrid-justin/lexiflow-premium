import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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
  CreatePracticeAreaDto,
  QueryPracticeAreaDto,
  UpdatePracticeAreaDto,
} from "./dto";
import { PracticeService } from "./practice.service";

@ApiTags("Practice Areas")
@ApiBearerAuth("JWT-auth")
@Controller("practice")
@UseGuards(JwtAuthGuard)
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Get()
  @ApiOperation({ summary: "Get all practice areas" })
  @ApiResponse({ status: 200, description: "Practice areas retrieved" })
  async findAll(@Query() query: QueryPracticeAreaDto) {
    return this.practiceService.findAll(query);
  }

  @Get("statistics")
  @ApiOperation({ summary: "Get practice area statistics" })
  @ApiResponse({ status: 200, description: "Statistics retrieved" })
  async getStatistics() {
    return this.practiceService.getStatistics();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get practice area by ID" })
  @ApiResponse({ status: 200, description: "Practice area found" })
  @ApiResponse({ status: 404, description: "Practice area not found" })
  async findOne(@Param("id") id: string) {
    return this.practiceService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create new practice area" })
  @ApiResponse({ status: 201, description: "Practice area created" })
  async create(@Body() createDto: CreatePracticeAreaDto) {
    return this.practiceService.create(createDto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update practice area" })
  @ApiResponse({ status: 200, description: "Practice area updated" })
  async update(
    @Param("id") id: string,
    @Body() updateDto: UpdatePracticeAreaDto,
  ) {
    return this.practiceService.update(id, updateDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete practice area" })
  @ApiResponse({ status: 200, description: "Practice area deleted" })
  async remove(@Param("id") id: string) {
    return this.practiceService.remove(id);
  }
}
