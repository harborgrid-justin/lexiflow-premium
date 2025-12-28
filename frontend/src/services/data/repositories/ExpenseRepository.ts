import { FirmExpense } from '@/types';
import { Repository } from '@/services/core/Repository';
import { STORES } from '@/services/data/db';

export class ExpenseRepository extends Repository<FirmExpense> {
    constructor() {
        super(STORES.EXPENSES);
    }
}
