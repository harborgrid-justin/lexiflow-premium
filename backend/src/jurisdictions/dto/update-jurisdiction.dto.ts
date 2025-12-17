import { PartialType } from '@nestjs/swagger';
import { CreateJurisdictionDto } from './create-jurisdiction.dto';

export class UpdateJurisdictionDto extends PartialType(CreateJurisdictionDto) {}
