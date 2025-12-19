import { PartialType } from '@nestjs/swagger';
import { CreateSearchQueryDto } from './create-search-query.dto';

export class UpdateSearchQueryDto extends PartialType(CreateSearchQueryDto) {}
