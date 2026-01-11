import { IsEnum, IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';
import { ConnectorType, ConnectorStatus } from '../entities/connector.entity';

export class CreateConnectorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ConnectorType)
  type: ConnectorType;

  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsString()
  @IsOptional()
  connectionString?: string;

  @IsEnum(ConnectorStatus)
  @IsOptional()
  status?: ConnectorStatus;

  @IsObject()
  @IsOptional()
  configuration?: Record<string, unknown>;
}

export class UpdateConnectorDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(ConnectorType)
  @IsOptional()
  type?: ConnectorType;

  @IsString()
  @IsOptional()
  provider?: string;

  @IsString()
  @IsOptional()
  connectionString?: string;

  @IsEnum(ConnectorStatus)
  @IsOptional()
  status?: ConnectorStatus;

  @IsObject()
  @IsOptional()
  configuration?: Record<string, unknown>;
}
