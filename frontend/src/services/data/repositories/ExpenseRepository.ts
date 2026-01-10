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

  async getAll(options?: Record<string, unknown>): Promise<FirmExpense[]> {
    try {
      return await this.expensesApi.getAll(options);
    } catch (error) {
      console.error("[ExpenseRepository] Error fetching expenses:", error);
      throw error;
    }
  }

  async getById(id: string): Promise<FirmExpense | null> {
    try {
      return await this.expensesApi.getById(id);
    } catch (error) {
      console.error(`[ExpenseRepository] Error fetching expense ${id}:`, error);
      throw error;
    }
  }

  async add(item: Partial<FirmExpense>): Promise<FirmExpense> {
    try {
      // @ts-expect-error - mismatch or missing properties in Partial type vs expected DTO
      return await this.expensesApi.create(item);
    } catch (error) {
      console.error("[ExpenseRepository] Error creating expense:", error);
      throw error;
    }
  }

  async update(id: string, item: Partial<FirmExpense>): Promise<FirmExpense> {
    try {
      return await this.expensesApi.update(id, item);
    } catch (error) {
      console.error(`[ExpenseRepository] Error updating expense ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.expensesApi.delete(id);
    } catch (error) {
      console.error(`[ExpenseRepository] Error deleting expense ${id}:`, error);
      throw error;
    }
  }
}
