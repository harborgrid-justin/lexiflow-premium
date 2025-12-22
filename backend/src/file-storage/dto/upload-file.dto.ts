import { IsString, IsOptional, IsEnum, IsNumber, Min, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum StorageProvider {
  LOCAL = 'local',
  S3 = 's3',
  AZURE = 'azure',
  GCS = 'gcs'
}

export class UploadFileDto {
  @ApiProperty({ description: 'Original filename' })
  @IsString()
  filename!: string;

  @ApiProperty({ description: 'File MIME type' })
  @IsString()
  mimeType!: string;

  @ApiProperty({ description: 'File size in bytes' })
  @IsNumber()
  @Min(0)
  size!: number;

  @ApiProperty({ description: 'Storage path', required: false })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiProperty({ 
    description: 'Storage provider',
    enum: StorageProvider,
    default: StorageProvider.LOCAL
  })
  @IsOptional()
  @IsEnum(StorageProvider)
  provider?: StorageProvider;

  @ApiProperty({ description: 'Folder/directory', required: false })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiProperty({ description: 'Enable encryption', default: false })
  @IsOptional()
  @IsBoolean()
  encrypted?: boolean;
}
