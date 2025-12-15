import { Module } from '@nestjs/common';
import { MessengerController } from './messenger.controller';

@Module({
  controllers: [MessengerController],
  providers: [],
  exports: []
})
export class MessengerModule {}
