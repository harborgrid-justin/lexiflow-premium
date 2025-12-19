import { PartialType } from '@nestjs/swagger';
import { CreateEvidenceItemDto } from './create-evidence.dto';

export class UpdateEvidenceItemDto extends PartialType(CreateEvidenceItemDto) {}
