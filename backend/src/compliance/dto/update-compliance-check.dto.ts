import { PartialType } from '@nestjs/swagger';
import { CreateComplianceCheckDto } from './create-compliance-check.dto';

export class UpdateComplianceCheckDto extends PartialType(CreateComplianceCheckDto) {}
