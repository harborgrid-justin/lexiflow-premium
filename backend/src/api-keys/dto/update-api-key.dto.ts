import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateApiKeyDto } from './create-api-key.dto';

export class UpdateApiKeyDto extends PartialType(
  OmitType(CreateApiKeyDto, [] as const),
) {}
