import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessengerController } from './messenger.controller';
import { MessengerService } from './messenger.service';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message]),
    AuthModule
  ],
  controllers: [MessengerController],
  providers: [MessengerService],
  exports: [MessengerService]
})
export class MessengerModule {}
