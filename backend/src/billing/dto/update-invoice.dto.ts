import { PartialType } from '@nestjs/swagger';
import { CreateSimpleInvoiceDto } from './create-invoice.dto';

export class UpdateSimpleInvoiceDto extends PartialType(CreateSimpleInvoiceDto) {}
