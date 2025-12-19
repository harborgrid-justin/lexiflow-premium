import { IsString, IsOptional, IsNotEmpty, MaxLength, IsObject, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportTemplateDto {
  @ApiProperty({ 
    description: 'Template name',
    example: 'Standard Case Report',
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ 
    description: 'Template type',
    example: 'case_report',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type: string;

  @ApiPropertyOptional({ 
    description: 'Template content or structure'
  })
  @IsString()
  @IsOptional()
  template?: string;

  @ApiPropertyOptional({ 
    description: 'JSON schema for template parameters'
  })
  @IsObject()
  @IsOptional()
  schema?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'User ID who created the template'
  })
  @IsUUID()
  @IsOptional()
  createdBy?: string;

  @ApiPropertyOptional({ 
    description: 'Whether template is active',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
