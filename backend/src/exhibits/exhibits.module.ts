import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExhibitsController } from './exhibits.controller';
import { ExhibitsService } from './exhibits.service';
import { Exhibit } from './entities/exhibit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exhibit])],
  controllers: [ExhibitsController],
  providers: [ExhibitsService],
  exports: [ExhibitsService]
})
export class ExhibitsModule {}
