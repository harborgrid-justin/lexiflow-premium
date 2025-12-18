import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExhibitsController } from './exhibits.controller';
import { ExhibitsService } from './exhibits.service';
import { TrialExhibit } from './entities/trial-exhibit.entity';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([TrialExhibit])],
  controllers: [ExhibitsController],
  providers: [ExhibitsService],
  exports: [ExhibitsService]
})
export class ExhibitsModule {}
