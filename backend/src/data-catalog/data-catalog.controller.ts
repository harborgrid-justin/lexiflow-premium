import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DataCatalogService } from "./data-catalog.service";
import { UpdateDictionaryItemDto } from "./dto/update-dictionary-item.dto";

@ApiTags("Data Catalog")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("data-catalog")
export class DataCatalogController {
  constructor(private readonly dataCatalogService: DataCatalogService) {}

  @Get("domains")
  @ApiOperation({ summary: "Get data domains" })
  async getDomains() {
    return this.dataCatalogService.getDomains();
  }

  @Get("registry")
  @ApiOperation({ summary: "Get registry info" })
  async getRegistryInfo() {
    return this.dataCatalogService.getRegistryInfo();
  }

  @Get("lake/:folderId")
  @ApiOperation({ summary: "Get data lake items by folder" })
  async getDataLakeItems(@Param("folderId") folderId: string) {
    return this.dataCatalogService.getDataLakeItems(folderId);
  }

  @Get("lake")
  @ApiOperation({ summary: "Get root data lake items" })
  async getRootDataLakeItems() {
    return this.dataCatalogService.getDataLakeItems("root");
  }

  @Get("lineage")
  @ApiOperation({ summary: "Get data lineage graph" })
  async getLineageGraph() {
    return this.dataCatalogService.getLineageGraph();
  }

  @Patch("dictionary/:id")
  @ApiOperation({ summary: "Update dictionary item metadata" })
  async updateDictionaryItem(
    @Param("id") id: string,
    @Body() updates: UpdateDictionaryItemDto
  ) {
    return this.dataCatalogService.updateDictionaryItem(id, updates);
  }
}
