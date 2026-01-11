import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateRelationshipDto {
  @ApiProperty()
  @IsUUID()
  clientId!: string;

  @ApiProperty()
  @IsUUID()
  relatedClientId!: string;

  @ApiProperty()
  @IsString()
  relatedClientName!: string;

  @ApiProperty({
    enum: ["Parent", "Subsidiary", "Partner", "Competitor", "Vendor"],
  })
  @IsEnum(["Parent", "Subsidiary", "Partner", "Competitor", "Vendor"])
  relationshipType!: string;

  @ApiProperty()
  @IsNumber()
  strength!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
