import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { Expense, ExpenseStatus } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseFilterDto } from './dto/expense-filter.dto';
import { validateSortField, validateSortOrder } from '@common/utils/query-validation.util';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const markedUpAmount = createExpenseDto.markup
      ? createExpenseDto.amount * (1 + createExpenseDto.markup / 100)
      : createExpenseDto.amount;

    const expense = this.expenseRepository.create({
      ...createExpenseDto,
      markedUpAmount,
      status: createExpenseDto.status || ExpenseStatus.DRAFT,
      billable: createExpenseDto.billable !== undefined ? createExpenseDto.billable : true,
    });

    return await this.expenseRepository.save(expense);
  }

  async findAll(filterDto: ExpenseFilterDto): Promise<{ data: Expense[]; total: number }> {
    const {
      caseId,
      userId,
      status,
      category,
      billable,
      reimbursable,
      startDate,
      endDate,
      page = 1,
      limit = 50,
      sortBy = 'expenseDate',
      sortOrder = 'DESC',
    } = filterDto;

    const query = this.expenseRepository.createQueryBuilder('expense');

    if (caseId) {
      query.andWhere('expense.caseId = :caseId', { caseId });
    }

    if (userId) {
      query.andWhere('expense.userId = :userId', { userId });
    }

    if (status) {
      query.andWhere('expense.status = :status', { status });
    }

    if (category) {
      query.andWhere('expense.category = :category', { category });
    }

    if (billable !== undefined) {
      query.andWhere('expense.billable = :billable', { billable });
    }

    if (reimbursable !== undefined) {
      query.andWhere('expense.reimbursable = :reimbursable', { reimbursable });
    }

    if (startDate && endDate) {
      query.andWhere('expense.expenseDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.andWhere('expense.expenseDate >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('expense.expenseDate <= :endDate', { endDate });
    }

    query.andWhere('expense.deletedAt IS NULL');

    const total = await query.getCount();

    // SQL injection protection
    const safeSortField = validateSortField('expense', sortBy);
    const safeSortOrder = validateSortOrder(sortOrder);

    query
      .orderBy(`expense.${safeSortField}`, safeSortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const data = await query.getMany();

    return { data, total };
  }

  async findOne(id: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    return expense;
  }

  async findByCase(caseId: string): Promise<Expense[]> {
    return await this.expenseRepository.find({
      where: { caseId, deletedAt: IsNull() },
      order: { expenseDate: 'DESC' },
    });
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findOne(id);

    // Recalculate marked up amount if needed
    if (updateExpenseDto.amount !== undefined || updateExpenseDto.markup !== undefined) {
      const amount = updateExpenseDto.amount ?? expense.amount;
      const markup = updateExpenseDto.markup ?? expense.markup;
      const markedUpAmount = markup ? amount * (1 + markup / 100) : amount;

      Object.assign(expense, updateExpenseDto, { markedUpAmount });
    } else {
      Object.assign(expense, updateExpenseDto);
    }

    return await this.expenseRepository.save(expense);
  }

  async remove(id: string): Promise<void> {
    const expense = await this.findOne(id);
    expense.deletedAt = new Date();
    await this.expenseRepository.save(expense);
  }

  async approve(id: string, approvedBy: string): Promise<Expense> {
    const expense = await this.findOne(id);
    expense.status = ExpenseStatus.APPROVED;
    expense.approvedBy = approvedBy;
    expense.approvedAt = new Date();
    return await this.expenseRepository.save(expense);
  }

  async bill(id: string, invoiceId: string, billedBy: string): Promise<Expense> {
    const expense = await this.findOne(id);
    expense.status = ExpenseStatus.BILLED;
    expense.invoiceId = invoiceId;
    expense.billedBy = billedBy;
    expense.billedAt = new Date();
    return await this.expenseRepository.save(expense);
  }

  async reimburse(id: string, reimbursedBy: string): Promise<Expense> {
    const expense = await this.findOne(id);
    expense.status = ExpenseStatus.REIMBURSED;
    expense.reimbursedBy = reimbursedBy;
    expense.reimbursedAt = new Date();
    return await this.expenseRepository.save(expense);
  }

  async getUnbilledByCase(caseId: string): Promise<Expense[]> {
    return await this.expenseRepository.find({
      where: {
        caseId,
        status: In([ExpenseStatus.APPROVED, ExpenseStatus.SUBMITTED]),
        billable: true,
        deletedAt: IsNull(),
      },
      order: { expenseDate: 'ASC' },
    });
  }

  async getTotalsByCase(
    caseId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{ total: number; billable: number; billed: number; unbilled: number }> {
    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.caseId = :caseId', { caseId })
      .andWhere('expense.deletedAt IS NULL');

    if (startDate && endDate) {
      query.andWhere('expense.expenseDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const expenses = await query.getMany();

    const total = expenses.reduce((sum, exp) => sum + Number(exp.markedUpAmount || exp.amount), 0);
    const billable = expenses
      .filter((e) => e.billable)
      .reduce((sum, exp) => sum + Number(exp.markedUpAmount || exp.amount), 0);
    const billed = expenses
      .filter((e) => e.status === ExpenseStatus.BILLED)
      .reduce((sum, exp) => sum + Number(exp.markedUpAmount || exp.amount), 0);
    const unbilled = expenses
      .filter((e) => e.billable && e.status !== ExpenseStatus.BILLED)
      .reduce((sum, exp) => sum + Number(exp.markedUpAmount || exp.amount), 0);

    return { total, billable, billed, unbilled };
  }
}
