import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional } from 'class-validator';

export class RunCheckDto {
  @ApiProperty({ description: 'Case ID to run compliance check on' })
  @IsUUID()
  caseId!: string;

  @ApiProperty({ description: 'Type of compliance check to run', required: false })
  @IsString()
  @IsOptional()
  type?: string;
}
