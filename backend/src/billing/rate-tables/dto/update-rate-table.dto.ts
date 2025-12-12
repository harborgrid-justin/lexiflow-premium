import { PartialType } from '@nestjs/mapped-types';
import { CreateRateTableDto } from './create-rate-table.dto';

export class UpdateRateTableDto extends PartialType(CreateRateTableDto) {}
