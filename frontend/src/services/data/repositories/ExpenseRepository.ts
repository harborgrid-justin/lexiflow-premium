import { ExpensesApiService } from "@/api/billing/expenses-api";
import { Repository } from "@/services/core/Repository";
import { FirmExpense } from "@/types";

export class ExpenseRepository extends Repository<FirmExpense> {
  private expensesApi: ExpensesApiService;

  constructor() {
    super("expenses");
    this.expensesApi = new ExpensesApiService();
    console.log("[ExpenseRepository] Initialized with Backend API");
  }

  override async getAll(
    options?: Record<string, unknown>
  ): Promise<FirmExpense[]> {
    try {
      return await this.expensesApi.getAll(options);
    } catch (error) {
      console.error("[ExpenseRepository] Error fetching expenses:", error);
      throw error;
    }
  }

  override async getById(id: string): Promise<FirmExpense | undefined> {
    try {
      const expense = await this.expensesApi.getById(id);
      return expense || undefined;
    } catch (error) {
      console.error(`[ExpenseRepository] Error fetching expense ${id}:`, error);
      throw error;
    }
  }

  override async add(item: Partial<FirmExpense>): Promise<FirmExpense> {
    try {
      // Cast to ensure required fields are present for API call
      return await this.expensesApi.create(item as Parameters<typeof this.expensesApi.create>[0]);
    } catch (error) {
      console.error("[ExpenseRepository] Error creating expense:", error);
      throw error;
    }
  }

  override async update(
    id: string,
    item: Partial<FirmExpense>
  ): Promise<FirmExpense> {
    try {
      return await this.expensesApi.update(id, item);
    } catch (error) {
      console.error(`[ExpenseRepository] Error updating expense ${id}:`, error);
      throw error;
    }
  }

  override async delete(id: string): Promise<void> {
    try {
      await this.expensesApi.delete(id);
    } catch (error) {
      console.error(`[ExpenseRepository] Error deleting expense ${id}:`, error);
      throw error;
    }
  }
}
