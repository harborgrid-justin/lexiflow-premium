import { IsString, IsEnum, IsOptional, IsDate, IsUUID, IsNotEmpty, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CaseType, CaseStatus } from '../entities/case.entity';

export class CreateCaseDto {
  @ApiProperty({ 
    description: 'Case title',
    example: 'Johnson v. Smith Corp',
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({ 
    description: 'Unique case number',
    example: 'CASE-2025-001',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  caseNumber!: string;

  @ApiPropertyOptional({ 
    description: 'Case description',
    example: 'Employment discrimination lawsuit'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Type of case',
    enum: CaseType,
    example: CaseType.CIVIL
  })
  @IsEnum(CaseType)
  @IsOptional()
  type?: CaseType;

  @ApiPropertyOptional({ 
    description: 'Current status of the case',
    enum: CaseStatus,
    example: CaseStatus.ACTIVE
  })
  @IsEnum(CaseStatus)
  @IsOptional()
  status?: CaseStatus;

  @ApiPropertyOptional({ 
    description: 'Practice area',
    example: 'Employment Law',
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  practiceArea?: string;

  @ApiPropertyOptional({ 
    description: 'Jurisdiction',
    example: 'California',
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  jurisdiction?: string;

  @ApiPropertyOptional({ 
    description: 'Court name',
    example: 'Superior Court of California',
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  court?: string;

  @ApiPropertyOptional({ 
    description: 'Judge name',
    example: 'Hon. Jane Smith',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  judge?: string;

  @ApiPropertyOptional({ 
    description: 'Referred magistrate judge',
    example: 'Hon. John Doe',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  referredJudge?: string;

  @ApiPropertyOptional({ 
    description: 'Magistrate judge name',
    example: 'Hon. Emily Brown',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  magistrateJudge?: string;

  @ApiPropertyOptional({ 
    description: 'Filing date',
    example: '2025-01-15T00:00:00Z'
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  filingDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  trialDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  closeDate?: Date;

  @ApiPropertyOptional({ 
    description: 'Date case was terminated',
    example: '2025-12-31T00:00:00Z'
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateTerminated?: Date;

  @ApiPropertyOptional({ 
    description: 'Jury demand type',
    example: 'None',
    maxLength: 50
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  juryDemand?: string;

  @ApiPropertyOptional({ 
    description: 'Cause of action (e.g., 28:0158 Bankruptcy Appeal from Judgment/Order)',
    example: '28:0158 Bankruptcy Appeal from Judgment/Order',
    maxLength: 500
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  causeOfAction?: string;

  @ApiPropertyOptional({ 
    description: 'Nature of suit description',
    example: 'Bankruptcy Appeal',
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  natureOfSuit?: string;

  @ApiPropertyOptional({ 
    description: 'Nature of suit code',
    example: '422',
    maxLength: 10
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  natureOfSuitCode?: string;

  @ApiPropertyOptional({ 
    description: 'Related cases in other courts',
    example: [{ court: '4th Circuit', caseNumber: '24-02160' }]
  })
  @IsOptional()
  relatedCases?: { court: string; caseNumber: string; relationship?: string }[];

  @IsUUID()
  @IsOptional()
  assignedTeamId?: string;

  @IsUUID()
  @IsOptional()
  leadAttorneyId?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ 
    description: 'Client UUID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsOptional()
  clientId?: string;
}
