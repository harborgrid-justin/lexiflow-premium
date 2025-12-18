import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { Client } from '../entities/client.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client]),
    JwtModule.register({}),
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService]
})
export class ClientsModule {}
