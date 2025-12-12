import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateDocketEntryDto } from './create-docket-entry.dto';

export class UpdateDocketEntryDto extends PartialType(
  OmitType(CreateDocketEntryDto, ['caseId'] as const),
) {}
