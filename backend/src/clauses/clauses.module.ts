import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClausesController } from './clauses.controller';
import { ClausesService } from './clauses.service';
import { Clause } from './entities/clause.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Clause])],
  controllers: [ClausesController],
  providers: [ClausesService],
  exports: [ClausesService],
})
export class ClausesModule {}
