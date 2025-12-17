import { PartialType } from '@nestjs/swagger';
import { CreateJurisdictionRuleDto } from './create-jurisdiction-rule.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateJurisdictionRuleDto extends PartialType(
  OmitType(CreateJurisdictionRuleDto, ['jurisdictionId'] as const)
) {}
