import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ApiKeyScope {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin',
}

export class CreateApiKeyDto {
  @ApiProperty({ description: 'Name for the API key' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Description of the API key purpose', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Scopes for the API key',
    enum: ApiKeyScope,
    isArray: true,
    default: [ApiKeyScope.READ],
  })
  @IsArray()
  @IsEnum(ApiKeyScope, { each: true })
  scopes!: ApiKeyScope[];

  @ApiProperty({ description: 'Expiration date for the API key', required: false })
  @IsOptional()
  expiresAt?: Date;

  @ApiProperty({ description: 'Rate limit per hour', required: false })
  @IsOptional()
  rateLimit?: number;
}
