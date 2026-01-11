import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateOpportunityDto {
  @ApiProperty()
  @IsUUID()
  clientId!: string;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsNumber()
  value!: number;

  @ApiProperty({
    enum: [
      "Lead",
      "Qualified",
      "Proposal",
      "Negotiation",
      "Closed Won",
      "Closed Lost",
    ],
  })
  @IsEnum([
    "Lead",
    "Qualified",
    "Proposal",
    "Negotiation",
    "Closed Won",
    "Closed Lost",
  ])
  stage!: string;

  @ApiProperty()
  @IsNumber()
  probability!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString() // TypeORM handles date string parsing usually, or use IsDateString
  expectedCloseDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  practiceArea?: string;
}
