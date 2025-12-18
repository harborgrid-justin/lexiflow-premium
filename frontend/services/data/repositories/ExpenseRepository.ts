import { FirmExpense } from '../../../types';
import { Repository } from '../../../core/Repository';
import { STORES } from '../db';

export class ExpenseRepository extends Repository<FirmExpense> {
    constructor() {
        super(STORES.EXPENSES);
    }
}
