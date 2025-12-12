import { PartialType } from '@nestjs/mapped-types';
import { CreatePartyDto } from './create-party.dto';
import { OmitType } from '@nestjs/mapped-types';

export class UpdatePartyDto extends PartialType(
  OmitType(CreatePartyDto, ['caseId'] as const),
) {}
