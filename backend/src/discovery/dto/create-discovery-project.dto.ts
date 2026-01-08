import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsDateString, IsNumber, IsObject } from 'class-validator';
import { DiscoveryProjectType } from '../entities/discovery-project.entity';

export class CreateDiscoveryProjectDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  matterId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  caseId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: DiscoveryProjectType, default: DiscoveryProjectType.LITIGATION })
  @IsOptional()
  @IsEnum(DiscoveryProjectType)
  projectType?: DiscoveryProjectType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateRangeStart?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateRangeEnd?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  keyTerms?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  dataSources?: Array<{
    sourceId: string;
    sourceName: string;
    sourceType: string;
    location: string;
    status: string;
  }>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  protocolSettings?: {
    reviewProtocol?: string;
    qcPercentage?: number;
    privilegeReview?: boolean;
    tarEnabled?: boolean;
    batesPrefix?: string;
    productionFormat?: string;
  };
}
