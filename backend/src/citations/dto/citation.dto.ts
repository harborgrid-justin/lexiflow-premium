import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCitationDto {
  @ApiProperty()
  @IsString()
  citation: string;

  @ApiProperty()
  @IsString()
  court: string;

  @ApiProperty()
  @IsNumber()
  year: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  caseId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  documentId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  status?: string;
}

export class UpdateCitationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  citation?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  court?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  year?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  status?: string;
}
