import { PartialType } from '@nestjs/swagger';
import { CreateServiceJobDto } from './create-service-job.dto';

export class UpdateServiceJobDto extends PartialType(CreateServiceJobDto) {}
