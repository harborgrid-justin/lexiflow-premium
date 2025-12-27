import { IsString, IsEnum, IsOptional, IsObject} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JurisdictionSystem, JurisdictionType } from '@jurisdictions/entities/jurisdiction.entity';

export class CreateJurisdictionDto {
  @ApiProperty({ description: 'Name of the jurisdiction' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: JurisdictionSystem, description: 'Jurisdiction system type' })
  @IsEnum(JurisdictionSystem)
  system!: JurisdictionSystem;

  @ApiProperty({ enum: JurisdictionType, description: 'Jurisdiction type' })
  @IsEnum(JurisdictionType)
  type!: JurisdictionType;

  @ApiPropertyOptional({ description: 'Region (circuit, state, country)' })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional({ description: 'Description of the jurisdiction' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Official website URL' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ description: 'Rules documentation URL' })
  @IsString()
  @IsOptional()
  rulesUrl?: string;

  @ApiPropertyOptional({ description: 'Short code identifier' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: {
    iconColor?: string;
    parties?: number;
    status?: string;
    fullName?: string;
    jurisdiction?: string;
  };
}
