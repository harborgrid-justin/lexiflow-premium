import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";

export class CreateLeadDto {
  @ApiProperty({ example: "John" })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: "Doe" })
  @IsString()
  lastName!: string;

  @ApiPropertyOptional({ example: "john.doe@example.com" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: "+15551234567" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: "Acme Corp" })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({
    example: "New",
    enum: ["New", "Contacted", "Qualified", "Lost", "Converted"],
  })
  @IsOptional()
  @IsEnum(["New", "Contacted", "Qualified", "Lost", "Converted"])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
