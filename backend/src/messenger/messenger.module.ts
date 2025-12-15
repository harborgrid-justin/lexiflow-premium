import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessengerController } from './messenger.controller';
import { MessengerService } from './messenger.service';
import { Conversation, Message } from './entities/messenger.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message])],
  controllers: [MessengerController],
  providers: [MessengerService],
  exports: [MessengerService]
})
export class MessengerModule {}
