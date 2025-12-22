import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFromTemplateDto {
  @ApiProperty({ description: 'Template ID to use' })
  @IsNotEmpty()
  @IsUUID()
  templateId!: string;

  @ApiProperty({ description: 'Case ID to associate with' })
  @IsNotEmpty()
  @IsUUID()
  caseId!: string;

  @ApiProperty({ description: 'Title for the new pleading' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({ description: 'User ID creating the pleading' })
  @IsNotEmpty()
  @IsString()
  userId!: string;
}
