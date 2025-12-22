import { IsString, IsOptional, IsNotEmpty, MaxLength, IsBoolean, IsUUID, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ExpertType {
  TECHNICAL = 'Technical',
  MEDICAL = 'Medical',
  FINANCIAL = 'Financial',
  FORENSIC = 'Forensic',
  INDUSTRY = 'Industry',
  OTHER = 'Other'
}

export class CreateWarRoomDto {
  @ApiProperty({ 
    description: 'War room name',
    example: 'Trial Preparation - Smith v. Jones',
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ 
    description: 'War room description'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Associated case ID'
  })
  @IsUUID()
  @IsNotEmpty()
  caseId: string;

  @ApiPropertyOptional({ 
    description: 'War room status',
    default: 'active'
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ 
    description: 'Whether war room is active',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ 
    description: 'Team members (user IDs)',
    type: [String]
  })
  @IsOptional()
  members?: string[];

  @ApiPropertyOptional({ 
    description: 'Additional settings'
  })
  @IsOptional()
  settings?: Record<string, unknown>;
}
