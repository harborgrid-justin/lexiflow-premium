import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber } from 'class-validator';

export enum DataSourceType {
  POSTGRES = 'PostgreSQL',
  SNOWFLAKE = 'Snowflake',
  MONGODB = 'MongoDB',
  S3 = 'Amazon S3',
}

export class TestConnectionDto {
  @IsEnum(DataSourceType)
  @IsNotEmpty()
  type!: DataSourceType;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  host!: string;

  @IsNumber()
  @IsOptional()
  port?: number;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  database?: string;
}
