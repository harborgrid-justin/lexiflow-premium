import { PartialType } from '@nestjs/swagger';
import { CreateDiscoveryRequestDto } from './create-discovery-request.dto';

export class UpdateDiscoveryRequestDto extends PartialType(CreateDiscoveryRequestDto) {}
