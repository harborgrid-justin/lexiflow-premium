import { PartialType } from '@nestjs/swagger';
import { CreateWitnessDto } from './create-witness.dto';

export class UpdateWitnessDto extends PartialType(CreateWitnessDto) {}
