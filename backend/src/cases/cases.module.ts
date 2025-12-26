import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { CaseImportService } from './case-import.service';
import { Case } from './entities/case.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Case]),
    ConfigModule,
  ],
  controllers: [CasesController],
  providers: [CasesService, CaseImportService],
  exports: [CasesService, CaseImportService],
})
export class CasesModule {}
