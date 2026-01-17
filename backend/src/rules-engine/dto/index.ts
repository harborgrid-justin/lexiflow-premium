import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateRuleDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiProperty()
  @IsObject()
  conditions: Record<string, any>;

  @ApiProperty()
  @IsObject()
  actions: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateRuleDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  actions?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class QueryRuleDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ExecuteRuleDto {
  @ApiProperty()
  @IsString()
  ruleId: string;

  @ApiProperty()
  @IsObject()
  context: Record<string, any>;
}
