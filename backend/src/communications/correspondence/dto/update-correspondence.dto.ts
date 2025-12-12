import { PartialType } from '@nestjs/swagger';
import { CreateCorrespondenceDto } from './create-correspondence.dto';

export class UpdateCorrespondenceDto extends PartialType(CreateCorrespondenceDto) {}
