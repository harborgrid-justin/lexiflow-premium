import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';

@Injectable({ scope: Scope.REQUEST })
export class DiscoveryLoader {
  // Inject DiscoveryServices here
  // constructor(
  //   private readonly discoveryRequestService: DiscoveryRequestService,
  //   private readonly depositionService: DepositionService,
  //   private readonly productionService: ProductionService,
  // ) {}

  // Create a DataLoader for loading discovery requests by case ID
  public readonly batchDiscoveryRequestsByCaseId = new DataLoader(
    async (caseIds: readonly string[]) => {
      // TODO: Implement batch loading logic
      // const requests = await this.discoveryRequestService.findByCaseIds([...caseIds]);
      // const requestsByCaseId = new Map<string, any[]>();
      // requests.forEach(request => {
      //   if (!requestsByCaseId.has(request.caseId)) {
      //     requestsByCaseId.set(request.caseId, []);
      //   }
      //   requestsByCaseId.get(request.caseId)!.push(request);
      // });
      // return caseIds.map(id => requestsByCaseId.get(id) || []);
      return caseIds.map(() => []);
    },
  );

  // Create a DataLoader for loading depositions by case ID
  public readonly batchDepositionsByCaseId = new DataLoader(
    async (caseIds: readonly string[]) => {
      // TODO: Implement batch loading logic
      // const depositions = await this.depositionService.findByCaseIds([...caseIds]);
      // const depositionsByCaseId = new Map<string, any[]>();
      // depositions.forEach(deposition => {
      //   if (!depositionsByCaseId.has(deposition.caseId)) {
      //     depositionsByCaseId.set(deposition.caseId, []);
      //   }
      //   depositionsByCaseId.get(deposition.caseId)!.push(deposition);
      // });
      // return caseIds.map(id => depositionsByCaseId.get(id) || []);
      return caseIds.map(() => []);
    },
  );

  // Create a DataLoader for loading productions by case ID
  public readonly batchProductionsByCaseId = new DataLoader(
    async (caseIds: readonly string[]) => {
      // TODO: Implement batch loading logic
      // const productions = await this.productionService.findByCaseIds([...caseIds]);
      // const productionsByCaseId = new Map<string, any[]>();
      // productions.forEach(production => {
      //   if (!productionsByCaseId.has(production.caseId)) {
      //     productionsByCaseId.set(production.caseId, []);
      //   }
      //   productionsByCaseId.get(production.caseId)!.push(production);
      // });
      // return caseIds.map(id => productionsByCaseId.get(id) || []);
      return caseIds.map(() => []);
    },
  );

  // Create a DataLoader for loading legal holds by case ID
  public readonly batchLegalHoldsByCaseId = new DataLoader(
    async (caseIds: readonly string[]) => {
      // TODO: Implement batch loading logic
      return caseIds.map(() => []);
    },
  );

  // Load discovery requests by case ID
  async loadDiscoveryRequestsByCaseId(caseId: string) {
    return this.batchDiscoveryRequestsByCaseId.load(caseId);
  }

  // Load depositions by case ID
  async loadDepositionsByCaseId(caseId: string) {
    return this.batchDepositionsByCaseId.load(caseId);
  }

  // Load productions by case ID
  async loadProductionsByCaseId(caseId: string) {
    return this.batchProductionsByCaseId.load(caseId);
  }

  // Load legal holds by case ID
  async loadLegalHoldsByCaseId(caseId: string) {
    return this.batchLegalHoldsByCaseId.load(caseId);
  }
}
