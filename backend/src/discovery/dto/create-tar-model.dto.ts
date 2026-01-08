import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsNumber } from 'class-validator';
import { TARModelType } from '../entities/tar-model.entity';

export class CreateTARModelDto {
  @ApiProperty()
  @IsString()
  projectId!: string;

  @ApiProperty()
  @IsString()
  modelName!: string;

  @ApiProperty({ enum: TARModelType, default: TARModelType.CAL })
  @IsOptional()
  @IsEnum(TARModelType)
  modelType?: TARModelType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  seedKeywords?: string[];

  @ApiProperty({ required: false, default: 0.75 })
  @IsOptional()
  @IsNumber()
  targetRecall?: number;

  @ApiProperty({ required: false, default: 0.70 })
  @IsOptional()
  @IsNumber()
  targetPrecision?: number;

  @ApiProperty({ required: false, default: 0.50 })
  @IsOptional()
  @IsNumber()
  confidenceThreshold?: number;
}

export class AddTrainingDocumentsDto {
  @ApiProperty()
  @IsArray()
  trainingDocuments!: Array<{
    documentId: string;
    batesNumber: string;
    label: 'responsive' | 'non_responsive';
    reviewer: string;
    reviewDate: Date;
  }>;
}
