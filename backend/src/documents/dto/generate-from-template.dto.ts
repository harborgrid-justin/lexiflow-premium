import { IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateFromTemplateDto {
  @ApiProperty({ description: 'Template ID' })
  @IsString()
  templateId: string;

  @ApiProperty({ description: 'Variables to populate template' })
  @IsObject()
  variables: Record<string, any>;
}
