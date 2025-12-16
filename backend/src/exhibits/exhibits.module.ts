import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExhibitsController } from './exhibits.controller';
import { ExhibitsService } from './exhibits.service';
import { Exhibit } from './entities/exhibit.entity';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([Exhibit])],
  controllers: [ExhibitsController],
  providers: [ExhibitsService],
  exports: [ExhibitsService]
})
export class ExhibitsModule {}
