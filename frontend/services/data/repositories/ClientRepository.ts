import { Client } from '../../../types';
import { Repository } from '../../core/Repository';
import { STORES } from '../db';

export class ClientRepository extends Repository<Client> {
    constructor() {
        super(STORES.CLIENTS);
    }
    
    async generatePortalToken(clientId: string) {
        return `token-${clientId}-${Date.now()}`;
    }
}
