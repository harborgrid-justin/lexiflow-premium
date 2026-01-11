import { IsString, IsOptional, IsBoolean, IsNumber } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateDictionaryItemDto {
  @ApiPropertyOptional({ description: "Description of the data element" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description:
      "Data classification level (e.g. Public, Internal, Confidential)",
  })
  @IsOptional()
  @IsString()
  classification?: string;

  @ApiPropertyOptional({ description: "Whether the element contains PII" })
  @IsOptional()
  @IsBoolean()
  isPII?: boolean;

  @ApiPropertyOptional({ description: "Owner of the data element" })
  @IsOptional()
  @IsString()
  owner?: string;

  @ApiPropertyOptional({ description: "Data quality score (0-100)" })
  @IsOptional()
  @IsNumber()
  dataQualityScore?: number;
}
