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
    // COMPLIANCE: Validate account title includes "Trust Account" or "Escrow Account"
    const accountTitleCompliant =
      createTrustAccountDto.accountName.toLowerCase().includes('trust account') ||
      createTrustAccountDto.accountName.toLowerCase().includes('escrow account');

    if (!accountTitleCompliant) {
      throw new BadRequestException(
        'Account name must include "Trust Account" or "Escrow Account" for compliance',
      );
    }

    const trustAccount = this.trustAccountRepository.create({
      ...createTrustAccountDto,
      balance: createTrustAccountDto.balance || 0,
      status: createTrustAccountDto.status || TrustAccountStatus.ACTIVE,
      accountTitleCompliant,
      recordRetentionYears: createTrustAccountDto.recordRetentionYears || 7,
      reconciliationStatus: 'pending',
      // Set next reconciliation due to first of next month
      nextReconciliationDue: this.getNextMonthFirstDay(),
    });

    return await this.trustAccountRepository.save(trustAccount);
  }

  private getNextMonthFirstDay(): string {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const isoString = nextMonth.toISOString().split('T')[0];
    return isoString || '';
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

    // COMPLIANCE: Calculate prompt deposit compliance (24-48 hours)
    let promptDepositCompliant = true;
    if (depositDto.fundsReceivedDate) {
      const fundsReceived = new Date(depositDto.fundsReceivedDate);
      const transactionDate = new Date(depositDto.transactionDate);
      const hoursElapsed = (transactionDate.getTime() - fundsReceived.getTime()) / (1000 * 60 * 60);
      promptDepositCompliant = hoursElapsed <= 48;
    }

    // COMPLIANCE: Validate payment method (no cash/ATM)
    const paymentMethodCompliant = 
      !depositDto.paymentMethod ||
      (depositDto.paymentMethod.toLowerCase() !== 'cash' && 
       depositDto.paymentMethod.toLowerCase() !== 'atm');

    if (!paymentMethodCompliant) {
      throw new BadRequestException('Cash/ATM deposits are not allowed for trust accounts');
    }

    const transaction = this.transactionRepository.create({
      trustAccountId: accountId,
      transactionType: TransactionType.DEPOSIT,
      transactionDate: depositDto.transactionDate,
      amount: depositDto.amount,
      balanceAfter: newBalance,
      description: depositDto.description,
      payor: depositDto.payor,
      referenceNumber: depositDto.referenceNumber,
      paymentMethod: depositDto['paymentMethod'],
      notes: depositDto.notes,
      createdBy,
      promptDepositCompliant,
      paymentMethodCompliant,
      fundsReceivedDate: depositDto.fundsReceivedDate ? new Date(depositDto.fundsReceivedDate) : undefined,
      transactionSource: 'client',
      isAdvancedFee: Boolean(depositDto.isAdvancedFee),
      clientNotified: false, // Will be updated by notification system
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

    // COMPLIANCE: Zero balance principle - prevent negative balances
    if (Number(account.balance) < Number(withdrawalDto.amount)) {
      throw new BadRequestException('Insufficient funds in trust account');
    }

    // COMPLIANCE: Validate payment method (no cash/ATM for withdrawals)
    const paymentMethod = withdrawalDto.paymentMethod?.toLowerCase();
    if (paymentMethod === 'cash' || paymentMethod === 'atm') {
      throw new BadRequestException(
        'Cash/ATM withdrawals are prohibited for trust accounts per state bar rules',
      );
    }                             

    // COMPLIANCE: Check number required for checks
    if (paymentMethod === 'check' && !withdrawalDto.checkNumber) {
      throw new BadRequestException('Check number is required for check withdrawals');
    }

    // COMPLIANCE: Validate signatory authorization (if provided)
    const signatoryAuthorized: boolean = !createdBy || 
      (Array.isArray(account.authorizedSignatories) && 
       typeof createdBy === 'string' && 
       (account.authorizedSignatories as string[]).includes(createdBy));

    if (!signatoryAuthorized) {
      throw new BadRequestException('User does not have signatory authority for this trust account');
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
      paymentMethod: withdrawalDto.paymentMethod as string | undefined,
      paymentMethodCompliant: paymentMethod !== 'cash' && paymentMethod !== 'atm',
      signatoryAuthorized,
      transactionSource: 'client',
      isEarnedFee: Boolean(withdrawalDto.isEarnedFee),
      isOperatingFundTransfer: Boolean(withdrawalDto.isOperatingFundTransfer),
    });

    await this.transactionRepository.save(transaction);

    // COMPLIANCE: Update check number sequence
    if (withdrawalDto.checkNumber && paymentMethod === 'check') {
      const checkNum = parseInt(withdrawalDto.checkNumber);
      if (!isNaN(checkNum)) {
        account.checkNumberRangeCurrent = checkNum;
      }
    }

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
