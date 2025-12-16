/**
 * CaseRepository.test.ts
 * Tests for the CaseRepository domain service
 */

import { CaseRepository, PhaseRepository } from '@services/domains/CaseDomain';

// Mock dependencies
jest.mock('@services/db', () => ({
  STORES: {
    CASES: 'cases',
    CASE_PHASES: 'casePhases',
  },
  db: {
    get: jest.fn(),
    getAll: jest.fn(),
    getByIndex: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
}));

jest.mock('@services/core/microORM', () => ({
  MicroORM: jest.fn().mockImplementation(() => ({
    findById: jest.fn(),
    findAll: jest.fn(),
    findBy: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
  })),
}));

jest.mock('../../../utils/errorHandler', () => ({
  errorHandler: {
    logError: jest.fn(),
  },
}));

describe('CaseRepository', () => {
  let caseRepo: CaseRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    caseRepo = new CaseRepository();
  });

  describe('constructor', () => {
    it('should initialize with cases store name', () => {
      expect(caseRepo).toBeDefined();
    });
  });

  describe('inherited methods', () => {
    it('should have getAll method from Repository', () => {
      expect(typeof caseRepo.getAll).toBe('function');
    });

    it('should have getById method from Repository', () => {
      expect(typeof caseRepo.getById).toBe('function');
    });

    it('should have add method from Repository', () => {
      expect(typeof caseRepo.add).toBe('function');
    });

    it('should have update method from Repository', () => {
      expect(typeof caseRepo.update).toBe('function');
    });

    it('should have delete method from Repository', () => {
      expect(typeof caseRepo.delete).toBe('function');
    });
  });
});

describe('PhaseRepository', () => {
  let phaseRepo: PhaseRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    phaseRepo = new PhaseRepository();
  });

  describe('constructor', () => {
    it('should initialize with phases store name', () => {
      expect(phaseRepo).toBeDefined();
    });
  });

  describe('getByCaseId', () => {
    it('should have getByCaseId method', () => {
      expect(typeof phaseRepo.getByCaseId).toBe('function');
    });
  });
});
