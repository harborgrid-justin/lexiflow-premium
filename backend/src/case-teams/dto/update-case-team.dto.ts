import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCaseTeamDto } from './create-case-team.dto';
import { IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCaseTeamDto extends PartialType(
  OmitType(CreateCaseTeamDto, ['caseId', 'userId'] as const),
) {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  removedDate?: Date;
}
