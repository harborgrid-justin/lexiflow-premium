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
  Head,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation , ApiResponse }from '@nestjs/swagger';
import { TrustAccountsService } from './trust-accounts.service';
import { CreateTrustAccountDto } from './dto/create-trust-account.dto';
import { UpdateTrustAccountDto } from './dto/update-trust-account.dto';
import { DepositDto, WithdrawalDto, CreateTransactionDto } from './dto/trust-transaction.dto';
import { TrustAccount, TrustAccountStatus } from './entities/trust-account.entity';
import { TrustTransaction } from './entities/trust-transaction.entity';

@ApiTags('Billing - Trust Accounts')
@ApiBearerAuth('JWT-auth')

@Controller('billing/trust-accounts')
export class TrustAccountsController {
  constructor(private readonly trustAccountsService: TrustAccountsService) {}

  // Health check endpoint
  @Head()
  @HttpCode(HttpStatus.OK)
  async health() {
    return;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() createTrustAccountDto: CreateTrustAccountDto): Promise<TrustAccount> {
    return await this.trustAccountsService.create(createTrustAccountDto);
  }

  @Get()
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Query('clientId') clientId?: string,
    @Query('status') status?: TrustAccountStatus,
  ): Promise<TrustAccount[]> {
    return await this.trustAccountsService.findAll(clientId, status);
  }

  @Get('low-balance')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getLowBalanceAccounts(@Query('threshold') threshold?: number): Promise<TrustAccount[]> {
    return await this.trustAccountsService.getLowBalanceAccounts(threshold);
  }

  @Get(':id')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string): Promise<TrustAccount> {
    return await this.trustAccountsService.findOne(id);
  }

  @Get(':id/balance')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async getBalance(@Param('id') id: string): Promise<{ balance: number; currency: string }> {
    return await this.trustAccountsService.getBalance(id);
  }

  @Get(':id/transactions')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async getTransactions(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<TrustTransaction[]> {
    return await this.trustAccountsService.getTransactions(id, startDate, endDate);
  }

  @Post(':id/deposit')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async deposit(
    @Param('id') id: string,
    @Body() depositDto: DepositDto,
    @Body('createdBy') createdBy?: string,
  ): Promise<TrustTransaction> {
    return await this.trustAccountsService.deposit(id, depositDto, createdBy);
  }

  @Post(':id/withdraw')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async withdraw(
    @Param('id') id: string,
    @Body() withdrawalDto: WithdrawalDto,
    @Body('createdBy') createdBy?: string,
  ): Promise<TrustTransaction> {
    return await this.trustAccountsService.withdraw(id, withdrawalDto, createdBy);
  }

  @Post(':id/transaction')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async createTransaction(
    @Param('id') id: string,
    @Body() transactionDto: CreateTransactionDto,
    @Body('createdBy') createdBy?: string,
  ): Promise<TrustTransaction> {
    return await this.trustAccountsService.createTransaction(id, transactionDto, createdBy);
  }

  @Put(':id')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTrustAccountDto: UpdateTrustAccountDto,
  ): Promise<TrustAccount> {
    return await this.trustAccountsService.update(id, updateTrustAccountDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.trustAccountsService.remove(id);
  }
}

