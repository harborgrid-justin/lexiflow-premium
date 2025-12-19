import { PartialType } from '@nestjs/swagger';
import { CreatePerformanceMetricDto } from './create-performance-metric.dto';

export class UpdatePerformanceMetricDto extends PartialType(CreatePerformanceMetricDto) {}
