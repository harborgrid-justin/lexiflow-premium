import { User } from '../../../types';
import { Repository } from '../../../core/Repository';
import { STORES } from '../db';

export class UserRepository extends Repository<User> {
    constructor() {
        super(STORES.USERS);
    }
}
