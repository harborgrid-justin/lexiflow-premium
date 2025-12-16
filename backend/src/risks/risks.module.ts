import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { RisksController } from './risks.controller';
import { RisksService } from './risks.service';
import { Risk } from './entities/risk.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Risk]),
    JwtModule.register({}),
  ],
  controllers: [RisksController],
  providers: [RisksService],
  exports: [RisksService]
})
export class RisksModule {}
