import { IsString, IsEnum, IsOptional, IsEmail, IsDate, IsNotEmpty, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationType, OrganizationStatus } from '../entities/organization.entity';

export class CreateOrganizationDto {
  @ApiProperty({ 
    description: 'Organization name',
    example: 'Acme Corporation',
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ 
    description: 'Full legal name',
    example: 'Acme Corporation, Inc.',
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  legalName?: string;

  @ApiProperty({ 
    description: 'Organization type',
    enum: OrganizationType,
    example: OrganizationType.CORPORATION
  })
  @IsEnum(OrganizationType)
  @IsNotEmpty()
  organizationType: OrganizationType;

  @ApiPropertyOptional({ 
    description: 'Tax identification number',
    example: '12-3456789',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  taxId?: string;

  @ApiPropertyOptional({ 
    description: 'Registration number',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  registrationNumber?: string;

  @ApiPropertyOptional({ 
    description: 'Jurisdiction',
    example: 'Delaware',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  jurisdiction?: string;

  @ApiPropertyOptional({ 
    description: 'Incorporation date',
    type: Date
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  incorporationDate?: Date;

  @ApiPropertyOptional({ 
    description: 'Primary address'
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
    description: 'State/Province',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ 
    description: 'Postal/ZIP code',
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
    description: 'Primary email',
    example: 'contact@acme.com'
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ 
    description: 'Primary phone',
    maxLength: 50
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ 
    description: 'Website URL',
    maxLength: 500
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  website?: string;

  @ApiPropertyOptional({ 
    description: 'Organization status',
    enum: OrganizationStatus,
    default: OrganizationStatus.ACTIVE
  })
  @IsEnum(OrganizationStatus)
  @IsOptional()
  status?: OrganizationStatus;

  @ApiPropertyOptional({ 
    description: 'Number of employees'
  })
  @IsOptional()
  employeeCount?: number;

  @ApiPropertyOptional({ 
    description: 'Industry/sector',
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  industry?: string;

  @ApiPropertyOptional({ 
    description: 'Description or notes'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Parent organization ID'
  })
  @IsString()
  @IsOptional()
  parentOrganizationId?: string;

  @ApiPropertyOptional({ 
    description: 'Additional metadata'
  })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
