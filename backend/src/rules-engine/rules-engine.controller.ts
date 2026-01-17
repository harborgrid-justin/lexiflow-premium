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
  CreateRuleDto,
  ExecuteRuleDto,
  QueryRuleDto,
  UpdateRuleDto,
} from "./dto";
import { RulesEngineService } from "./rules-engine.service";

@ApiTags("Rules Engine")
@ApiBearerAuth("JWT-auth")
@Controller("rules-engine")
@UseGuards(JwtAuthGuard)
export class RulesEngineController {
  constructor(private readonly rulesEngineService: RulesEngineService) {}

  @Get()
  @ApiOperation({ summary: "Get all rules" })
  @ApiResponse({ status: 200, description: "Rules retrieved" })
  async findAll(@Query() query: QueryRuleDto) {
    return this.rulesEngineService.findAll(query);
  }

  @Get("categories")
  @ApiOperation({ summary: "Get rule categories" })
  @ApiResponse({ status: 200, description: "Categories retrieved" })
  async getCategories() {
    return this.rulesEngineService.getCategories();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get rule by ID" })
  @ApiResponse({ status: 200, description: "Rule found" })
  @ApiResponse({ status: 404, description: "Rule not found" })
  async findOne(@Param("id") id: string) {
    return this.rulesEngineService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create new rule" })
  @ApiResponse({ status: 201, description: "Rule created" })
  async create(@Body() createDto: CreateRuleDto) {
    return this.rulesEngineService.create(createDto);
  }

  @Post("execute")
  @ApiOperation({ summary: "Execute a rule" })
  @ApiResponse({ status: 200, description: "Rule executed" })
  async execute(@Body() executeDto: ExecuteRuleDto) {
    return this.rulesEngineService.execute(executeDto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update rule" })
  @ApiResponse({ status: 200, description: "Rule updated" })
  async update(@Param("id") id: string, @Body() updateDto: UpdateRuleDto) {
    return this.rulesEngineService.update(id, updateDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete rule" })
  @ApiResponse({ status: 200, description: "Rule deleted" })
  async remove(@Param("id") id: string) {
    return this.rulesEngineService.remove(id);
  }
}
