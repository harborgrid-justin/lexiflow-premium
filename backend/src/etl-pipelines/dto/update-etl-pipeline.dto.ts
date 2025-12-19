import { PartialType } from '@nestjs/swagger';
import { CreateETLPipelineDto } from './create-etl-pipeline.dto';

export class UpdateETLPipelineDto extends PartialType(CreateETLPipelineDto) {}
