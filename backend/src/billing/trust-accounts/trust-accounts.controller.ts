import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TrustAccountsService } from './trust-accounts.service';
import { CreateTrustAccountDto } from './dto/create-trust-account.dto';
import { UpdateTrustAccountDto } from './dto/update-trust-account.dto';
import { DepositDto, WithdrawalDto, CreateTransactionDto } from './dto/trust-transaction.dto';
import { TrustAccount, TrustAccountStatus } from './entities/trust-account.entity';
import { TrustTransaction } from './entities/trust-transaction.entity';

@Controller('api/v1/billing/trust-accounts')
export class TrustAccountsController {
  constructor(private readonly trustAccountsService: TrustAccountsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTrustAccountDto: CreateTrustAccountDto): Promise<TrustAccount> {
    return await this.trustAccountsService.create(createTrustAccountDto);
  }

  @Get()
  async findAll(
    @Query('clientId') clientId?: string,
    @Query('status') status?: TrustAccountStatus,
  ): Promise<TrustAccount[]> {
    return await this.trustAccountsService.findAll(clientId, status);
  }

  @Get('low-balance')
  async getLowBalanceAccounts(@Query('threshold') threshold?: number): Promise<TrustAccount[]> {
    return await this.trustAccountsService.getLowBalanceAccounts(threshold);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TrustAccount> {
    return await this.trustAccountsService.findOne(id);
  }

  @Get(':id/balance')
  async getBalance(@Param('id') id: string): Promise<{ balance: number; currency: string }> {
    return await this.trustAccountsService.getBalance(id);
  }

  @Get(':id/transactions')
  async getTransactions(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<TrustTransaction[]> {
    return await this.trustAccountsService.getTransactions(id, startDate, endDate);
  }

  @Post(':id/deposit')
  async deposit(
    @Param('id') id: string,
    @Body() depositDto: DepositDto,
    @Body('createdBy') createdBy?: string,
  ): Promise<TrustTransaction> {
    return await this.trustAccountsService.deposit(id, depositDto, createdBy);
  }

  @Post(':id/withdraw')
  async withdraw(
    @Param('id') id: string,
    @Body() withdrawalDto: WithdrawalDto,
    @Body('createdBy') createdBy?: string,
  ): Promise<TrustTransaction> {
    return await this.trustAccountsService.withdraw(id, withdrawalDto, createdBy);
  }

  @Post(':id/transaction')
  async createTransaction(
    @Param('id') id: string,
    @Body() transactionDto: CreateTransactionDto,
    @Body('createdBy') createdBy?: string,
  ): Promise<TrustTransaction> {
    return await this.trustAccountsService.createTransaction(id, transactionDto, createdBy);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTrustAccountDto: UpdateTrustAccountDto,
  ): Promise<TrustAccount> {
    return await this.trustAccountsService.update(id, updateTrustAccountDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.trustAccountsService.remove(id);
  }
}
