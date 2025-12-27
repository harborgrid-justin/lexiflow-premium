import { IsString, IsEnum, IsOptional, IsArray, IsBoolean, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RuleType } from '@jurisdictions/entities/jurisdiction-rule.entity';

export class CreateJurisdictionRuleDto {
  @ApiProperty({ description: 'Jurisdiction ID this rule belongs to' })
  @IsUUID()
  jurisdictionId!: string;

  @ApiProperty({ description: 'Rule code (e.g., FRCP 26)' })
  @IsString()
  code!: string;

  @ApiProperty({ description: 'Rule name' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: RuleType, description: 'Type of rule' })
  @IsEnum(RuleType)
  type!: RuleType;

  @ApiPropertyOptional({ description: 'Rule description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Full text of the rule' })
  @IsString()
  @IsOptional()
  fullText?: string;

  @ApiPropertyOptional({ description: 'URL to rule documentation' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ description: 'Related citations', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  citations?: string[];

  @ApiPropertyOptional({ description: 'Effective date of the rule' })
  @IsDateString()
  @IsOptional()
  effectiveDate?: Date;

  @ApiPropertyOptional({ description: 'Whether the rule is currently active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
