import { PhaseRepository } from "@/services/domain/CaseDomain";
import { DataQualityService } from "@/services/domain/DataQualityDomain";
import { KnowledgeRepository } from "@/services/domain/KnowledgeDomain";
import { AnalysisRepository } from "../repositories/AnalysisRepository";
import { CitationRepository } from "../repositories/CitationRepository";
import { ClientRepository } from "../repositories/ClientRepository";
import { DiscoveryRepository } from "../repositories/DiscoveryRepository";
import { EntityRepository } from "../repositories/EntityRepository";
import { EvidenceRepository } from "../repositories/EvidenceRepository";
import { HRRepository } from "../repositories/HRRepository";
import {
  IntegratedBillingRepository,
  IntegratedCaseRepository,
  IntegratedDocketRepository,
  IntegratedDocumentRepository,
} from "../repositories/IntegratedRepositories";
import { MotionRepository } from "../repositories/MotionRepository";
import { OrganizationRepository } from "../repositories/OrganizationRepository";
import { PleadingRepository } from "../repositories/PleadingRepository";
import { ProjectRepository } from "../repositories/ProjectRepository";
import { RepositoryRegistry } from "../repositories/RepositoryRegistry";
import { RiskRepository } from "../repositories/RiskAssessmentRepository";
import { TaskRepository } from "../repositories/TaskRepository";
import { TrialRepository } from "../repositories/TrialRepository";
import { WitnessRepository } from "../repositories/WitnessRepository";
import { WorkflowRepository } from "../repositories/WorkflowRepository";

/**
 * Factory functions ensure single instance per repository type.
 * Prevents memory leaks and duplicate event subscriptions.
 */

// Core Integrated Repositories
export const getIntegratedCaseRepository = () =>
  RepositoryRegistry.getOrCreate(
    "IntegratedCaseRepository",
    () => new IntegratedCaseRepository()
  );

export const getIntegratedDocketRepository = () =>
  RepositoryRegistry.getOrCreate(
    "IntegratedDocketRepository",
    () => new IntegratedDocketRepository()
  );

export const getIntegratedDocumentRepository = () =>
  RepositoryRegistry.getOrCreate(
    "IntegratedDocumentRepository",
    () => new IntegratedDocumentRepository()
  );

export const getIntegratedBillingRepository = () =>
  RepositoryRegistry.getOrCreate(
    "IntegratedBillingRepository",
    () => new IntegratedBillingRepository()
  );

// Standard Repositories
export const getEvidenceRepository = () =>
  RepositoryRegistry.getOrCreate(
    "EvidenceRepository",
    () => new EvidenceRepository()
  );

export const getDiscoveryRepository = () =>
  RepositoryRegistry.getOrCreate(
    "DiscoveryRepository",
    () => new DiscoveryRepository()
  );

export const getTrialRepository = () =>
  RepositoryRegistry.getOrCreate(
    "TrialRepository",
    () => new TrialRepository()
  );

export const getPleadingRepository = () =>
  RepositoryRegistry.getOrCreate(
    "PleadingRepository",
    () => new PleadingRepository()
  );

export const getKnowledgeRepository = () =>
  RepositoryRegistry.getOrCreate(
    "KnowledgeRepository",
    () => new KnowledgeRepository()
  );

export const getAnalysisRepository = () =>
  RepositoryRegistry.getOrCreate(
    "AnalysisRepository",
    () => new AnalysisRepository()
  );

export const getPhaseRepository = () =>
  RepositoryRegistry.getOrCreate(
    "PhaseRepository",
    () => new PhaseRepository()
  );

export const getDataQualityService = () =>
  RepositoryRegistry.getOrCreate(
    "DataQualityService",
    () => new DataQualityService()
  );

export const getHRRepository = () =>
  RepositoryRegistry.getOrCreate("HRRepository", () => HRRepository);

export const getWorkflowRepository = () =>
  RepositoryRegistry.getOrCreate(
    "WorkflowRepository",
    () => WorkflowRepository
  );

export const getTasksRepository = () =>
  RepositoryRegistry.getOrCreate("TasksRepository", () => new TaskRepository());

export const getProjectsRepository = () =>
  RepositoryRegistry.getOrCreate(
    "ProjectsRepository",
    () => new ProjectRepository()
  );

export const getRisksRepository = () =>
  RepositoryRegistry.getOrCreate("RisksRepository", () => new RiskRepository());

export const getMotionsRepository = () =>
  RepositoryRegistry.getOrCreate(
    "MotionsRepository",
    () => new MotionRepository()
  );

export const getClientsRepository = () =>
  RepositoryRegistry.getOrCreate(
    "ClientsRepository",
    () => new ClientRepository()
  );

export const getCitationsRepository = () =>
  RepositoryRegistry.getOrCreate(
    "CitationsRepository",
    () => new CitationRepository()
  );

export const getEntitiesRepository = () =>
  RepositoryRegistry.getOrCreate(
    "EntitiesRepository",
    () => new EntityRepository()
  );

export const getOrganizationsRepository = () =>
  RepositoryRegistry.getOrCreate(
    "OrganizationsRepository",
    () => new OrganizationRepository()
  );

export const getWitnessesRepository = () =>
  RepositoryRegistry.getOrCreate(
    "WitnessesRepository",
    () => new WitnessRepository()
  );
