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
import { CreatePropertyDto, QueryPropertyDto, UpdatePropertyDto } from "./dto";
import { RealEstateService } from "./real-estate.service";

@ApiTags("Real Estate")
@ApiBearerAuth("JWT-auth")
@Controller("real-estate")
@UseGuards(JwtAuthGuard)
export class RealEstateController {
  constructor(private readonly realEstateService: RealEstateService) {}

  @Get()
  @ApiOperation({ summary: "Get all properties" })
  @ApiResponse({ status: 200, description: "Properties retrieved" })
  async findAll(@Query() query: QueryPropertyDto) {
    return this.realEstateService.findAll(query);
  }

  @Get("portfolio-summary")
  @ApiOperation({ summary: "Get portfolio summary" })
  @ApiResponse({ status: 200, description: "Portfolio summary retrieved" })
  async getPortfolioSummary() {
    return this.realEstateService.getPortfolioSummary();
  }

  @Get("inventory")
  @ApiOperation({ summary: "Get property inventory (RPUID)" })
  @ApiResponse({ status: 200, description: "Inventory retrieved" })
  async getInventory(@Query() query: QueryPropertyDto) {
    return this.realEstateService.getInventory(query);
  }

  @Get("utilization")
  @ApiOperation({ summary: "Get utilization analytics" })
  @ApiResponse({ status: 200, description: "Utilization data retrieved" })
  async getUtilization() {
    return this.realEstateService.getUtilization();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get property by ID" })
  @ApiResponse({ status: 200, description: "Property found" })
  @ApiResponse({ status: 404, description: "Property not found" })
  async findOne(@Param("id") id: string) {
    return this.realEstateService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create new property" })
  @ApiResponse({ status: 201, description: "Property created" })
  async create(@Body() createDto: CreatePropertyDto) {
    return this.realEstateService.create(createDto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update property" })
  @ApiResponse({ status: 200, description: "Property updated" })
  async update(@Param("id") id: string, @Body() updateDto: UpdatePropertyDto) {
    return this.realEstateService.update(id, updateDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete property" })
  @ApiResponse({ status: 200, description: "Property deleted" })
  async remove(@Param("id") id: string) {
    return this.realEstateService.remove(id);
  }
}
