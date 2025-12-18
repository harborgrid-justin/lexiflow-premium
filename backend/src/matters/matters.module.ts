import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MattersService } from './matters.service';
import { MattersController } from './matters.controller';
import { Matter } from './entities/matter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Matter])],
  controllers: [MattersController],
  providers: [MattersService],
  exports: [MattersService],
})
export class MattersModule {}
