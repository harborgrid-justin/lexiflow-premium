import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TrustAccount, TrustAccountStatus } from './entities/trust-account.entity';
import { TrustTransaction, TransactionType } from './entities/trust-transaction.entity';
import { CreateTrustAccountDto } from './dto/create-trust-account.dto';
import { UpdateTrustAccountDto } from './dto/update-trust-account.dto';
import { DepositDto, WithdrawalDto, CreateTransactionDto } from './dto/trust-transaction.dto';

@Injectable()
export class TrustAccountsService {
  constructor(
    @InjectRepository(TrustAccount)
    private readonly trustAccountRepository: Repository<TrustAccount>,
    @InjectRepository(TrustTransaction)
    private readonly transactionRepository: Repository<TrustTransaction>,
  ) {}

  async create(createTrustAccountDto: CreateTrustAccountDto): Promise<TrustAccount> {
    const trustAccount = this.trustAccountRepository.create({
      ...createTrustAccountDto,
      balance: createTrustAccountDto.balance || 0,
      status: createTrustAccountDto.status || TrustAccountStatus.ACTIVE,
    });

    return await this.trustAccountRepository.save(trustAccount);
  }

  async findAll(clientId?: string, status?: TrustAccountStatus): Promise<TrustAccount[]> {
    const query = this.trustAccountRepository.createQueryBuilder('trustAccount');

    if (clientId) {
      query.where('trustAccount.clientId = :clientId', { clientId });
    }

    if (status) {
      query.andWhere('trustAccount.status = :status', { status });
    }

    query
      .andWhere('trustAccount.deletedAt IS NULL')
      .orderBy('trustAccount.createdAt', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<TrustAccount> {
    const trustAccount = await this.trustAccountRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!trustAccount) {
      throw new NotFoundException(`Trust account with ID ${id} not found`);
    }

    return trustAccount;
  }

  async update(id: string, updateTrustAccountDto: UpdateTrustAccountDto): Promise<TrustAccount> {
    const trustAccount = await this.findOne(id);
    Object.assign(trustAccount, updateTrustAccountDto);
    return await this.trustAccountRepository.save(trustAccount);
  }

  async remove(id: string): Promise<void> {
    const trustAccount = await this.findOne(id);

    if (Number(trustAccount.balance) > 0) {
      throw new BadRequestException('Cannot delete trust account with positive balance');
    }

    trustAccount.deletedAt = new Date();
    trustAccount.status = TrustAccountStatus.CLOSED;
    await this.trustAccountRepository.save(trustAccount);
  }

  async getTransactions(
    accountId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<TrustTransaction[]> {
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.trustAccountId = :accountId', { accountId });

    if (startDate && endDate) {
      query.andWhere('transaction.transactionDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.andWhere('transaction.transactionDate >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('transaction.transactionDate <= :endDate', { endDate });
    }

    query
      .andWhere('transaction.deletedAt IS NULL')
      .orderBy('transaction.transactionDate', 'DESC')
      .addOrderBy('transaction.createdAt', 'DESC');

    return await query.getMany();
  }

  async deposit(accountId: string, depositDto: DepositDto, createdBy?: string): Promise<TrustTransaction> {
    const account = await this.findOne(accountId);

    if (account.status !== TrustAccountStatus.ACTIVE) {
      throw new BadRequestException('Cannot deposit to inactive trust account');
    }

    const newBalance = Number(account.balance) + Number(depositDto.amount);

    const transaction = this.transactionRepository.create({
      trustAccountId: accountId,
      transactionType: TransactionType.DEPOSIT,
      transactionDate: depositDto.transactionDate,
      amount: depositDto.amount,
      balanceAfter: newBalance,
      description: depositDto.description,
      payor: depositDto.payor,
      referenceNumber: depositDto.referenceNumber,
      paymentMethod: depositDto.paymentMethod,
      notes: depositDto.notes,
      createdBy,
    });

    await this.transactionRepository.save(transaction);

    account.balance = newBalance;
    await this.trustAccountRepository.save(account);

    return transaction;
  }

  async withdraw(accountId: string, withdrawalDto: WithdrawalDto, createdBy?: string): Promise<TrustTransaction> {
    const account = await this.findOne(accountId);

    if (account.status !== TrustAccountStatus.ACTIVE) {
      throw new BadRequestException('Cannot withdraw from inactive trust account');
    }

    if (Number(account.balance) < Number(withdrawalDto.amount)) {
      throw new BadRequestException('Insufficient funds in trust account');
    }

    const newBalance = Number(account.balance) - Number(withdrawalDto.amount);

    const transaction = this.transactionRepository.create({
      trustAccountId: accountId,
      transactionType: TransactionType.WITHDRAWAL,
      transactionDate: withdrawalDto.transactionDate,
      amount: withdrawalDto.amount,
      balanceAfter: newBalance,
      description: withdrawalDto.description,
      payee: withdrawalDto.payee,
      checkNumber: withdrawalDto.checkNumber,
      relatedInvoiceId: withdrawalDto.relatedInvoiceId,
      notes: withdrawalDto.notes,
      createdBy,
    });

    await this.transactionRepository.save(transaction);

    account.balance = newBalance;
    await this.trustAccountRepository.save(account);

    return transaction;
  }

  async createTransaction(
    accountId: string,
    transactionDto: CreateTransactionDto,
    createdBy?: string,
  ): Promise<TrustTransaction> {
    const account = await this.findOne(accountId);

    let newBalance = Number(account.balance);

    if (
      transactionDto.transactionType === TransactionType.DEPOSIT ||
      transactionDto.transactionType === TransactionType.INTEREST
    ) {
      newBalance += Number(transactionDto.amount);
    } else if (
      transactionDto.transactionType === TransactionType.WITHDRAWAL ||
      transactionDto.transactionType === TransactionType.FEE
    ) {
      if (newBalance < Number(transactionDto.amount)) {
        throw new BadRequestException('Insufficient funds in trust account');
      }
      newBalance -= Number(transactionDto.amount);
    }

    const transaction = this.transactionRepository.create({
      ...transactionDto,
      trustAccountId: accountId,
      balanceAfter: newBalance,
      createdBy,
    });

    await this.transactionRepository.save(transaction);

    account.balance = newBalance;
    await this.trustAccountRepository.save(account);

    return transaction;
  }

  async getBalance(accountId: string): Promise<{ balance: number; currency: string }> {
    const account = await this.findOne(accountId);
    return {
      balance: Number(account.balance),
      currency: account.currency,
    };
  }

  async getLowBalanceAccounts(threshold: number = 1000): Promise<TrustAccount[]> {
    return await this.trustAccountRepository
      .createQueryBuilder('trustAccount')
      .where('trustAccount.balance < :threshold', { threshold })
      .andWhere('trustAccount.balance > 0')
      .andWhere('trustAccount.status = :status', { status: TrustAccountStatus.ACTIVE })
      .andWhere('trustAccount.deletedAt IS NULL')
      .orderBy('trustAccount.balance', 'ASC')
      .getMany();
  }
}
