import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateMotionDto } from './create-motion.dto';

export class UpdateMotionDto extends PartialType(
  OmitType(CreateMotionDto, ['caseId'] as const),
) {}
