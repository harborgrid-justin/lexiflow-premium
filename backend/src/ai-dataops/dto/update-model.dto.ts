import { PartialType } from '@nestjs/swagger';
import { RegisterModelDto } from './register-model.dto';

export class UpdateModelDto extends PartialType(RegisterModelDto) {}
