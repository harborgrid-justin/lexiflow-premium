import { PartialType } from '@nestjs/swagger';
import { CreateMigrationDto } from './create-migration.dto';

export class UpdateMigrationDto extends PartialType(CreateMigrationDto) {}
