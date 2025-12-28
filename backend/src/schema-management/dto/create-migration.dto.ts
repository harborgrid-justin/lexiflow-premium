import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SchemaColumnDefinition } from '../interfaces';

export class CreateMigrationDto {
  @ApiProperty({ description: 'Migration name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'SQL up migration' })
  @IsString()
  @IsNotEmpty()
  up!: string;

  @ApiProperty({ description: 'SQL down migration' })
  @IsString()
  @IsNotEmpty()
  down!: string;

  @ApiPropertyOptional({ description: 'Migration description' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateSnapshotDto {
  @ApiProperty({ description: 'Snapshot name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Snapshot description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Tables to include' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tables?: string[];
}

export class CreateTableDto {
  @ApiProperty({ description: 'Table name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Table columns', type: 'array' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  @IsNotEmpty()
  columns!: SchemaColumnDefinition[];

  @ApiPropertyOptional({ description: 'Table description' })
  @IsString()
  @IsOptional()
  description?: string;
}
