import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExecuteQueryDto {
  @ApiProperty({ description: 'SQL query to execute' })
  @IsString()
  @IsNotEmpty()
  query!: string;
}

export class SaveQueryDto {
  @ApiProperty({ description: 'Query name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'SQL query' })
  @IsString()
  @IsNotEmpty()
  query!: string;

  @ApiPropertyOptional({ description: 'Query description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Query tags' })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Share with others' })
  @IsBoolean()
  @IsOptional()
  isShared?: boolean;
}
