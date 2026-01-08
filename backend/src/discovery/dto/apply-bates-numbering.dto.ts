import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, Min, Max } from 'class-validator';

export class ApplyBatesNumberingDto {
  @ApiProperty()
  @IsString()
  projectId!: string;

  @ApiProperty()
  @IsArray()
  documentIds!: string[];

  @ApiProperty()
  @IsString()
  prefix!: string;

  @ApiProperty({ default: 1 })
  @IsNumber()
  @Min(0)
  startNumber!: number;

  @ApiProperty({ default: 7 })
  @IsNumber()
  @Min(4)
  @Max(10)
  numberLength!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  suffix?: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  includePageNumbers!: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productionId?: string;
}
