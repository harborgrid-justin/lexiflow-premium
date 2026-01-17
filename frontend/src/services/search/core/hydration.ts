/**
 * Search Index Hydration
 * @module services/search/core/hydration
 */

import { DataService } from "@/services/data/data-service.service";

import type { GlobalSearchResult } from "./types";
import type {
  Case,
  Clause,
  Client,
  DocketEntry,
  EvidenceItem,
  LegalDocument,
  LegalRule,
  Motion,
  User,
  WorkflowTask,
} from "@/types";

/** Fetch all domain data and normalize into search items */
export async function hydrateSearchIndex(): Promise<GlobalSearchResult[]> {
  const typedDataService = DataService as {
    cases: { getAll: () => Promise<Case[]> };
    clients: { getAll: () => Promise<Client[]> };
    tasks: { getAll: () => Promise<WorkflowTask[]> };
    evidence: { getAll: () => Promise<EvidenceItem[]> };
    users: { getAll: () => Promise<User[]> };
    documents: { getAll: () => Promise<LegalDocument[]> };
    docket: { getAll: () => Promise<DocketEntry[]> };
    motions: { getAll: () => Promise<Motion[]> };
    clauses: { getAll: () => Promise<Clause[]> };
    rules: { getAll: () => Promise<LegalRule[]> };
  };

  const [
    cases,
    clients,
    tasks,
    evidence,
    users,
    docs,
    docket,
    motions,
    clauses,
    rules,
  ] = await Promise.all([
    typedDataService.cases.getAll().catch((): Case[] => []),
    typedDataService.clients.getAll().catch((): Client[] => []),
    typedDataService.tasks.getAll().catch((): WorkflowTask[] => []),
    typedDataService.evidence.getAll().catch((): EvidenceItem[] => []),
    typedDataService.users.getAll().catch((): User[] => []),
    typedDataService.documents.getAll().catch((): LegalDocument[] => []),
    typedDataService.docket.getAll().catch((): DocketEntry[] => []),
    typedDataService.motions.getAll().catch((): Motion[] => []),
    typedDataService.clauses.getAll().catch((): Clause[] => []),
    typedDataService.rules.getAll().catch((): LegalRule[] => []),
  ]);

  return [
    ...cases.map((c: Case) => ({
      id: c.id,
      type: "case" as const,
      title: c.title,
      subtitle: `${c.id} - ${c.client}`,
      data: c,
    })),
    ...clients.map((c: Client) => ({
      id: c.id,
      type: "client" as const,
      title: c.name,
      subtitle: `Client - ${c.industry}`,
      data: c,
    })),
    ...tasks.map((t: WorkflowTask) => ({
      id: t.id,
      type: "task" as const,
      title: t.title,
      subtitle: `Task - Due: ${t.dueDate}`,
      data: t,
    })),
    ...evidence.map((e: EvidenceItem) => ({
      id: e.id,
      type: "evidence" as const,
      title: e.title,
      subtitle: `Evidence - ${e.type}`,
      data: e,
    })),
    ...users.map((u: User) => ({
      id: u.id,
      type: "user" as const,
      title: u.name,
      subtitle: `${u.role} - ${u.office}`,
      data: u,
    })),
    ...docs.map((d: LegalDocument) => ({
      id: d.id,
      type: "document" as const,
      title: d.title,
      subtitle: `Doc - ${d.type}`,
      data: d,
    })),
    ...docket.map((d: DocketEntry) => ({
      id: d.id,
      type: "docket" as const,
      title: d.title,
      subtitle: `Docket #${d.sequenceNumber}`,
      data: d,
    })),
    ...motions.map((m: Motion) => ({
      id: m.id,
      type: "motion" as const,
      title: m.title,
      subtitle: `Motion - ${m.status}`,
      data: m,
    })),
    ...clauses.map((c: Clause) => ({
      id: c.id,
      type: "clause" as const,
      title: c.name,
      subtitle: `Clause - ${c.category}`,
      data: c,
    })),
    ...rules.map((r: LegalRule) => ({
      id: r.id,
      type: "rule" as const,
      title: `${r.code} - ${r.name}`,
      subtitle: `Rule - ${r.type}`,
      data: r,
    })),
  ];
}
