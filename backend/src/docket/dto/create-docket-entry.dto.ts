import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  MaxLength,
  IsDate,
  IsInt,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DocketEntryType } from "@docket/entities/docket-entry.entity";

export class CreateDocketEntryDto {
  @ApiProperty({ description: "Case ID" })
  @IsUUID()
  @IsNotEmpty()
  caseId!: string;

  @ApiPropertyOptional({ description: "Sequence number" })
  @IsInt()
  @IsOptional()
  sequenceNumber?: number;

  @ApiPropertyOptional({ description: "Docket number" })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  docketNumber?: string;

  @ApiPropertyOptional({ description: "Date filed" })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateFiled?: Date;

  @ApiProperty({ description: "Entry date" })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  entryDate!: Date;

  @ApiProperty({ description: "Description" })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({ enum: DocketEntryType, description: "Entry type" })
  @IsEnum(DocketEntryType)
  @IsOptional()
  type?: DocketEntryType;

  @ApiPropertyOptional({ description: "Filed by" })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  filedBy?: string;

  @ApiPropertyOptional({ description: "Entry text content" })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({ description: "Document title" })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  documentTitle?: string;

  @ApiPropertyOptional({ description: "Document URL" })
  @IsString()
  @IsOptional()
  @MaxLength(2048)
  documentUrl?: string;

  @ApiPropertyOptional({ description: "Associated document ID" })
  @IsUUID()
  @IsOptional()
  documentId?: string;

  @ApiPropertyOptional({ description: "PACER docket number" })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  pacerDocketNumber?: string;

  @ApiPropertyOptional({ description: "PACER document number" })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  pacerDocumentNumber?: string;

  @ApiPropertyOptional({ description: "ECF document number (e.g., 1, 2, 10)" })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  ecfDocumentNumber?: string;

  @ApiPropertyOptional({
    description:
      "ECF document URL (e.g., https://ecf.vaed.uscourts.gov/doc1/...)",
  })
  @IsString()
  @IsOptional()
  @MaxLength(2048)
  ecfUrl?: string;

  @ApiPropertyOptional({ description: "Is sealed document" })
  @IsBoolean()
  @IsOptional()
  isSealed?: boolean;

  @ApiPropertyOptional({ description: "Is restricted access" })
  @IsBoolean()
  @IsOptional()
  isRestricted?: boolean;

  @ApiPropertyOptional({ description: "Filing fee amount" })
  @IsOptional()
  filingFee?: number;

  @ApiPropertyOptional({ description: "Fee receipt number" })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  feeReceiptNumber?: string;

  @ApiPropertyOptional({ description: "Judge name (for orders)" })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  judgeName?: string;

  @ApiPropertyOptional({
    description: "Signed by (e.g., District Judge Leonie M. Brinkema)",
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  signedBy?: string;

  @ApiPropertyOptional({
    description: "Docket clerk initials (e.g., dvanm, swil)",
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  docketClerkInitials?: string;

  @ApiPropertyOptional({ description: "Related docket numbers" })
  @IsOptional()
  relatedDocketNumbers?: string[];

  @ApiPropertyOptional({ description: "Additional notes" })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: "Attachments with ECF document numbers and URLs",
  })
  @IsOptional()
  attachments?: Array<{
    number: number;
    url: string;
    description?: string;
  }>;

  @ApiPropertyOptional({ description: "Additional metadata" })
  @IsOptional()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ description: "Appellate CM/ECF Data" })
  @IsOptional()
  appellateData?: any;
}
