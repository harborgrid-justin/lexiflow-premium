import { PartialType } from '@nestjs/mapped-types';
import { CreateTrustAccountDto } from './create-trust-account.dto';

export class UpdateTrustAccountDto extends PartialType(CreateTrustAccountDto) {}
