import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @IsOptional()
  tables?: string[];
}

export class CreateTableDto {
  @ApiProperty({ description: 'Table name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Table columns' })
  @IsNotEmpty()
  columns: {
    name: string;
    type: string;
    pk?: boolean;
    notNull?: boolean;
    unique?: boolean;
    fk?: string;
    defaultValue?: string;
  }[];

  @ApiPropertyOptional({ description: 'Table description' })
  @IsString()
  @IsOptional()
  description?: string;
}
