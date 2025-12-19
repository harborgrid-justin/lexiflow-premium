import { PartialType } from '@nestjs/swagger';
import { CreateLegalEntityDto } from './create-legal-entity.dto';

export class UpdateLegalEntityDto extends PartialType(CreateLegalEntityDto) {}
