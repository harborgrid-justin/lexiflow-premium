import { PartialType } from '@nestjs/swagger';
import { CreateCaseDto } from './create-case.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCaseDto extends PartialType(CreateCaseDto) {
  @ApiPropertyOptional({
    description: 'Whether case is archived',
    default: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}
