import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetFileDto {
  @ApiProperty({ description: 'File ID or path' })
  @IsString()
  fileId: string;
}
