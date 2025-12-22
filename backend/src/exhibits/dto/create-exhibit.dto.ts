import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ExhibitType {
  DOCUMENT = 'Document',
  PHOTO = 'Photo',
  VIDEO = 'Video',
  AUDIO = 'Audio',
  PHYSICAL = 'Physical',
  DIGITAL = 'Digital'
}

export enum ExhibitStatus {
  DRAFT = 'Draft',
  MARKED = 'Marked',
  ADMITTED = 'Admitted',
  REJECTED = 'Rejected',
  WITHDRAWN = 'Withdrawn'
}

export class CreateExhibitDto {
  @ApiProperty()
  @IsString()
  exhibitNumber!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty({ enum: ExhibitType })
  @IsEnum(ExhibitType)
  type!: ExhibitType;

  @ApiProperty({ enum: ExhibitStatus, default: ExhibitStatus.DRAFT })
  @IsEnum(ExhibitStatus)
  status!: ExhibitStatus;

  @ApiProperty()
  @IsString()
  caseId!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  documentId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  source?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  custodian?: string;
}
