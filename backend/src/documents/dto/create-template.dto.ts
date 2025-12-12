import { IsString, IsOptional, IsBoolean, IsArray, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Template description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Template content (Handlebars syntax)' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Template category', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ description: 'Tags for categorization', required: false })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ description: 'Template variables', required: false })
  @IsArray()
  @IsOptional()
  variables?: string[];

  @ApiProperty({ description: 'Default variable values', required: false })
  @IsObject()
  @IsOptional()
  defaultVariables?: Record<string, any>;

  @ApiProperty({ description: 'Whether template is active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
