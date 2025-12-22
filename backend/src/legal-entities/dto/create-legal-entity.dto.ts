import { IsString, IsEnum, IsOptional, IsEmail, IsDate, IsNotEmpty, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LegalEntityType, LegalEntityStatus } from '../entities/legal-entity.entity';

export class CreateLegalEntityDto {
  @ApiProperty({ 
    description: 'Entity name',
    example: 'John Doe',
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ 
    description: 'Type of legal entity',
    enum: LegalEntityType,
    example: LegalEntityType.INDIVIDUAL
  })
  @IsEnum(LegalEntityType)
  @IsNotEmpty()
  entityType: LegalEntityType;

  @ApiPropertyOptional({ 
    description: 'Full legal name',
    example: 'John Michael Doe',
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  fullLegalName?: string;

  @ApiPropertyOptional({ 
    description: 'Tax ID/EIN/SSN',
    example: '123-45-6789',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  taxId?: string;

  @ApiPropertyOptional({ 
    description: 'Registration or ID number',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  registrationNumber?: string;

  @ApiPropertyOptional({ 
    description: 'Jurisdiction',
    example: 'California',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  jurisdiction?: string;

  @ApiPropertyOptional({ 
    description: 'Formation or birth date',
    type: Date
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  formationDate?: Date;

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
    description: 'Postal code',
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
    description: 'Entity status',
    enum: LegalEntityStatus,
    default: LegalEntityStatus.ACTIVE
  })
  @IsEnum(LegalEntityStatus)
  @IsOptional()
  status?: LegalEntityStatus;

  @ApiPropertyOptional({ 
    description: 'Description or notes'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Parent entity ID'
  })
  @IsString()
  @IsOptional()
  parentEntityId?: string;

  @ApiPropertyOptional({ 
    description: 'Additional metadata'
  })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
