import { PartialType } from '@nestjs/swagger';
import { CreateTrialEventDto } from './create-trial-event.dto';

export class UpdateTrialEventDto extends PartialType(CreateTrialEventDto) {}
