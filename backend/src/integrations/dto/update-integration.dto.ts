import { PartialType } from '@nestjs/swagger';
import { CreateIntegrationDto } from './create-integration.dto';

export class UpdateIntegrationDto extends PartialType(CreateIntegrationDto) {}
