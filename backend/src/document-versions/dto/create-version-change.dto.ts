import { IsString, IsNumber, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVersionChangeDto {
  @ApiProperty({ description: 'Document ID' })
  @IsString()
  documentId: string;

  @ApiProperty({ description: 'From version number' })
  @IsNumber()
  fromVersion: number;

  @ApiProperty({ description: 'To version number' })
  @IsNumber()
  toVersion: number;

  @ApiProperty({ description: 'Change type' })
  @IsString()
  changeType: string;

  @ApiProperty({ description: 'Change details', required: false })
  @IsObject()
  @IsOptional()
  changeDetails?: Record<string, any>;

  @ApiProperty({ description: 'User who made the change', required: false })
  @IsString()
  @IsOptional()
  changedBy?: string;
}
