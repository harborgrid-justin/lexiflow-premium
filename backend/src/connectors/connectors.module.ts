import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectorsService } from './connectors.service';
import { ConnectorsController } from './connectors.controller';
import { Connector } from './entities/connector.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Connector])],
  controllers: [ConnectorsController],
  providers: [ConnectorsService],
  exports: [ConnectorsService],
})
export class ConnectorsModule {}
