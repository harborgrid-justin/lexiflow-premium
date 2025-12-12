import { PartialType } from '@nestjs/mapped-types';
import { CreateCaseDto } from './create-case.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCaseDto extends PartialType(CreateCaseDto) {
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}
