import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VersioningController } from './versioning.controller';
import { VersioningService } from './versioning.service';
import { DataVersion } from './entities/data-version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DataVersion])],
  controllers: [VersioningController],
  providers: [VersioningService],
  exports: [VersioningService],
})
export class VersioningModule {}
