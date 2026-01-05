import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { ClientStatus, ClientType } from "./create-client.dto";

export class QueryClientsDto {
  @ApiPropertyOptional({
    description: "Filter by client status",
    enum: ClientStatus,
  })
  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;

  @ApiPropertyOptional({
    description: "Filter by client type",
    enum: ClientType,
  })
  @IsEnum(ClientType)
  @IsOptional()
  type?: ClientType;

  @ApiPropertyOptional({
    description: "Filter by assigned attorney ID",
  })
  @IsString()
  @IsOptional()
  attorneyId?: string;

  @ApiPropertyOptional({
    description: "Filter by portal access",
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  hasPortalAccess?: boolean;

  @ApiPropertyOptional({
    description: "Search term for client name, email, or reference",
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: "Number of records to return",
    example: 50,
  })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: "Number of records to skip",
    example: 0,
  })
  @IsOptional()
  offset?: number;

  @ApiPropertyOptional({
    description: "Field to sort by",
    example: "totalBilled",
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    description: "Sort order",
    enum: ["asc", "desc"],
    example: "desc",
  })
  @IsString()
  @IsOptional()
  sortOrder?: "asc" | "desc";
}
