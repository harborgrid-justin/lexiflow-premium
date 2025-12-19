import { PartialType } from '@nestjs/mapped-types';
import { CreateDiscoveryEvidenceDto } from './create-evidence.dto';

export class UpdateDiscoveryEvidenceDto extends PartialType(CreateDiscoveryEvidenceDto) {}
