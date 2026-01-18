import { ExpensesApiService } from "@/api/billing/expenses-api";
import { GenericRepository } from "@/services/core/factories";
import { type FirmExpense } from "@/types";

export class ExpenseRepository extends GenericRepository<FirmExpense> {
  protected apiService = new ExpensesApiService();
  protected repositoryName = "ExpenseRepository";

  constructor() {
    super("expenses");
    console.log("[ExpenseRepository] Initialized with Backend API");
  }
}
