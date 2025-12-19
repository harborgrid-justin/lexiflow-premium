import { IsString, IsEnum, IsOptional, IsUUID, IsEmail, IsNotEmpty, MaxLength, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WitnessType, WitnessStatus } from '../entities/witness.entity';

export class CreateWitnessDto {
  @ApiProperty({ 
    description: 'Associated case ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  caseId: string;

  @ApiProperty({ 
    description: 'Witness name',
    example: 'Jane Smith',
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ 
    description: 'Type of witness',
    enum: WitnessType,
    example: WitnessType.FACT_WITNESS
  })
  @IsEnum(WitnessType)
  @IsNotEmpty()
  witnessType: WitnessType;

  @ApiPropertyOptional({ 
    description: 'Witness status',
    enum: WitnessStatus,
    default: WitnessStatus.IDENTIFIED
  })
  @IsEnum(WitnessStatus)
  @IsOptional()
  status?: WitnessStatus;

  @ApiPropertyOptional({ 
    description: 'Email address'
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ 
    description: 'Phone number',
    maxLength: 50
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ 
    description: 'Mailing address'
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ 
    description: 'City',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ 
    description: 'State',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ 
    description: 'ZIP code',
    maxLength: 20
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  zipCode?: string;

  @ApiPropertyOptional({ 
    description: 'Country',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ 
    description: 'Occupation or profession',
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  occupation?: string;

  @ApiPropertyOptional({ 
    description: 'Employer or organization',
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  employer?: string;

  @ApiPropertyOptional({ 
    description: 'Relationship to the case'
  })
  @IsString()
  @IsOptional()
  relationshipToCase?: string;

  @ApiPropertyOptional({ 
    description: 'Expert qualifications (for expert witnesses)'
  })
  @IsString()
  @IsOptional()
  expertQualifications?: string;

  @ApiPropertyOptional({ 
    description: 'Testimony summary'
  })
  @IsString()
  @IsOptional()
  testimonySummary?: string;

  @ApiPropertyOptional({ 
    description: 'Interview notes'
  })
  @IsString()
  @IsOptional()
  interviewNotes?: string;

  @ApiPropertyOptional({ 
    description: 'Whether witness is friendly',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isFriendly?: boolean;

  @ApiPropertyOptional({ 
    description: 'Whether witness is available',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiPropertyOptional({ 
    description: 'Related document IDs',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  relatedDocumentIds?: string[];

  @ApiPropertyOptional({ 
    description: 'Additional metadata'
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
