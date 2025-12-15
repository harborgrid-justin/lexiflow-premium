import { PartialType } from '@nestjs/swagger';
import { CreateExhibitDto } from './create-exhibit.dto';

export class UpdateExhibitDto extends PartialType(CreateExhibitDto) {}
