import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Witness } from './entities/witness.entity';
import { WitnessesController } from './witnesses.controller';
import { WitnessesService } from './witnesses.service';

@Module({
  imports: [TypeOrmModule.forFeature([Witness])],
  controllers: [WitnessesController],
  providers: [WitnessesService],
  exports: [WitnessesService],
})
export class WitnessesModule {}
