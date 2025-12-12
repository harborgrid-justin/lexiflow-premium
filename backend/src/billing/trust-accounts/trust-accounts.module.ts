import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrustAccountsController } from './trust-accounts.controller';
import { TrustAccountsService } from './trust-accounts.service';
import { TrustAccount } from './entities/trust-account.entity';
import { TrustTransaction } from './entities/trust-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TrustAccount, TrustTransaction])],
  controllers: [TrustAccountsController],
  providers: [TrustAccountsService],
  exports: [TrustAccountsService],
})
export class TrustAccountsModule {}
