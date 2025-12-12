import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class ClientLoader {
  // Inject ClientService here
  // constructor(private readonly clientService: ClientService) {}

  // Create a DataLoader for loading clients by ID
  public readonly batchClients = new DataLoader(async (clientIds: readonly string[]) => {
    // TODO: Implement batch loading logic
    // const clients = await this.clientService.findByIds([...clientIds]);
    // const clientMap = new Map(clients.map(client => [client.id, client]));
    // return clientIds.map(id => clientMap.get(id) || null);
    return clientIds.map(() => null);
  });

  // Create a DataLoader for loading clients by case ID
  public readonly batchClientsByCaseId = new DataLoader(
    async (caseIds: readonly string[]) => {
      // TODO: Implement batch loading logic
      // const clients = await this.clientService.findByCaseIds([...caseIds]);
      // const clientsByCaseId = new Map<string, any>();
      // clients.forEach(client => {
      //   if (client.caseId) {
      //     clientsByCaseId.set(client.caseId, client);
      //   }
      // });
      // return caseIds.map(id => clientsByCaseId.get(id) || null);
      return caseIds.map(() => null);
    },
  );

  // Load a single client by ID
  async load(id: string) {
    return this.batchClients.load(id);
  }

  // Load multiple clients by IDs
  async loadMany(ids: string[]) {
    return this.batchClients.loadMany(ids);
  }

  // Load client by case ID
  async loadByCaseId(caseId: string) {
    return this.batchClientsByCaseId.load(caseId);
  }
}
