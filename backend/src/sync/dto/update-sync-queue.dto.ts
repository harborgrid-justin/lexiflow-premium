import { PartialType } from '@nestjs/swagger';
import { CreateSyncQueueDto } from './create-sync-queue.dto';

export class UpdateSyncQueueDto extends PartialType(CreateSyncQueueDto) {}
