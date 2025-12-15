import { SetMetadata } from '@nestjs/common';

export const TRANSACTION_KEY = 'TRANSACTION';

export const Transaction = () => SetMetadata(TRANSACTION_KEY, true);
