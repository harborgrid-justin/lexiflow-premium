import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';

export class FilePleadingDto {
  @ApiProperty({ description: 'Name of person filing' })
  @IsString()
  @IsNotEmpty()
  filedBy: string;

  @ApiProperty({ description: 'Date of filing' })
  @IsDateString()
  @IsNotEmpty()
  filedDate: string;

  @ApiPropertyOptional({ description: 'Court name' })
  @IsString()
  courtName?: string;
}
