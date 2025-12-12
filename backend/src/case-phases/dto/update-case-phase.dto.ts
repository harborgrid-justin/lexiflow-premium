import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCasePhaseDto } from './create-case-phase.dto';

export class UpdateCasePhaseDto extends PartialType(
  OmitType(CreateCasePhaseDto, ['caseId'] as const),
) {}
