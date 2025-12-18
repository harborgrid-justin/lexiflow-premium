import { PartialType } from '@nestjs/mapped-types';
import { CreateMatterDto } from './create-matter.dto';

export class UpdateMatterDto extends PartialType(CreateMatterDto) {}
