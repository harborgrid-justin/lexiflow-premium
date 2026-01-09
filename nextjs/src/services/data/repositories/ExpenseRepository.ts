import { FirmExpense } from "@/types";
import { Repository } from "@/services/core/Repository";
import { STORES } from "@/services/data/db";
import { isBackendApiEnabled } from "@/api";
import { ExpensesApiService } from "@/api/billing/expenses-api";

export class ExpenseRepository extends Repository<FirmExpense> {
  private expensesApi: ExpensesApiService;

  constructor() {
    super(STORES.EXPENSES);
    this.expensesApi = new ExpensesApiService();
  }

  override async getAll(): Promise<FirmExpense[]> {
    if (isBackendApiEnabled()) {
      return this.expensesApi.getAll();
    }
    return super.getAll();
  }

  override async getById(id: string): Promise<FirmExpense | undefined> {
    if (isBackendApiEnabled()) {
      try {
        return await this.expensesApi.getById(id);
      } catch (error) {
        console.warn("[ExpenseRepository] Failed to fetch from backend", error);
        return undefined;
      }
    }
    return super.getById(id);
  }

  override async add(
    item: Omit<FirmExpense, "id" | "createdAt" | "updatedAt">
  ): Promise<FirmExpense> {
    if (isBackendApiEnabled()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return this.expensesApi.create(item as any);
    }
    return super.add(item as FirmExpense);
  }

  override async update(
    id: string,
    item: Partial<FirmExpense>
  ): Promise<FirmExpense> {
    if (isBackendApiEnabled()) {
      return this.expensesApi.update(id, item);
    }
    return super.update(id, item);
  }

  override async delete(id: string): Promise<void> {
    if (isBackendApiEnabled()) {
      await this.expensesApi.delete(id);
      return;
    }
    return super.delete(id);
  }
}
