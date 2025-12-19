import { PartialType } from '@nestjs/swagger';
import { RegisterDataOpsModelDto } from './register-model.dto';

export class UpdateDataOpsModelDto extends PartialType(RegisterDataOpsModelDto) {}
