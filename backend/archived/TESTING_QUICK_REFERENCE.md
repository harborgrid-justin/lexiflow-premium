# Testing Quick Reference Guide
## LexiFlow Premium Backend - Enterprise Testing Standards

---

## 🚨 Critical Issues - Fix First

1. **0% Coverage Areas** (MUST FIX IMMEDIATELY)
   - ❌ All 5 GraphQL resolvers
   - ❌ Both WebSocket gateways
   - ❌ All 3 middleware components
   - ❌ All 3 exception filters

2. **Missing Test Types**
   - ❌ No integration tests (0 files)
   - ⚠️ Only 8 E2E tests (need 30+)
   - ⚠️ No DTO validation tests

3. **Coverage Gaps**
   - 139 of 169 services untested (17.7% coverage)
   - 75 of 98 controllers untested (23.5% coverage)

---

## 📋 Testing Checklist for New Code

### For Every New Service
```typescript
✅ Unit tests with mocked dependencies
✅ Test all public methods
✅ Test error conditions
✅ Test edge cases
✅ Use createMockRepository from testSetup.ts
✅ Clear mocks in beforeEach
✅ Target: 90%+ coverage
```

### For Every New Controller
```typescript
✅ Test all endpoints
✅ Test HTTP status codes (200, 201, 400, 401, 404, 500)
✅ Test request validation
✅ Test response format
✅ Test authentication/authorization
✅ Test error handling
```

### For Every New DTO
```typescript
✅ Create dto.spec.ts file
✅ Test valid data passes
✅ Test each required field
✅ Test validation rules
✅ Test edge cases
✅ Use class-validator's validate()
```

### For Every New Feature
```typescript
✅ Unit tests
✅ Integration test (if touches database)
✅ E2E test (if user-facing)
✅ Update existing tests if breaking changes
```

---

## 🛠️ Test Utilities - USE THESE!

### Mock Factories (Already Built - Use Them!)

```typescript
// From test/setup/testSetup.ts
import {
  createMockRepository,
  createMockConfigService,
  createMockJwtService,
  createMockCacheManager,
  createMockEventEmitter,
  createMockQueue
} from '../../../test/setup/testSetup';

// Example usage
const mockRepository = createMockRepository();
const mockConfig = createMockConfigService({ JWT_SECRET: 'test' });
```

### Test Data Factories

```typescript
// From src/test-utils/mock-factory.ts
import { MockFactory } from '@/test-utils/mock-factory';

const mockUser = MockFactory.createMockUser({ role: 'ADMIN' });
const mockCase = MockFactory.createMockCase({ status: 'ACTIVE' });
const mockDocument = MockFactory.createMockDocument();
const users = MockFactory.createMany(MockFactory.createMockUser, 5);
```

### Database Test Utilities

```typescript
// From src/test-utils/database-test.utils.ts
import { DatabaseTestUtils } from '@/test-utils/database-test.utils';

const dataSource = await DatabaseTestUtils.createTestDataSource();
await DatabaseTestUtils.cleanDatabase(dataSource);
await DatabaseTestUtils.withTransaction(dataSource, async (queryRunner) => {
  // Your test code
});
```

---

## 📝 Test Templates

### Service Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MyService } from './my.service';
import { MyEntity } from './entities/my.entity';
import { createMockRepository } from '../../../test/setup/testSetup';

describe('MyService', () => {
  let service: MyService;
  let repository: any;

  const mockEntity = {
    id: '123',
    name: 'Test',
    // ... other fields
  };

  beforeEach(async () => {
    const mockRepo = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MyService,
        { provide: getRepositoryToken(MyEntity), useValue: mockRepo }
      ]
    }).compile();

    service = module.get<MyService>(MyService);
    repository = module.get(getRepositoryToken(MyEntity));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of entities', async () => {
      repository.find.mockResolvedValue([mockEntity]);

      const result = await service.findAll();

      expect(result).toEqual([mockEntity]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return entity by id', async () => {
      repository.findOne.mockResolvedValue(mockEntity);

      const result = await service.findOne('123');

      expect(result).toEqual(mockEntity);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '123' } });
    });

    it('should throw NotFoundException when not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  // Test create, update, delete, error conditions, edge cases
});
```

### Controller Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MyController } from './my.controller';
import { MyService } from './my.service';

describe('MyController', () => {
  let controller: MyController;
  let service: MyService;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyController],
      providers: [{ provide: MyService, useValue: mockService }]
    }).compile();

    controller = module.get<MyController>(MyController);
    service = module.get<MyService>(MyService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /', () => {
    it('should return array of items', async () => {
      const mockData = [{ id: '1', name: 'Test' }];
      mockService.findAll.mockResolvedValue(mockData);

      const result = await controller.findAll();

      expect(result).toEqual(mockData);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  // Test all endpoints, status codes, validation, auth
});
```

### Integration Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MyService } from '../../src/my/my.service';
import { MyEntity } from '../../src/my/entities/my.entity';
import { createTestDatabaseHelper } from '../utils/testDatabase';

describe('My Integration Tests', () => {
  let service: MyService;
  const dbHelper = createTestDatabaseHelper();
  let dataSource: any;

  beforeAll(async () => {
    dataSource = await dbHelper.createTestDataSource({
      type: 'postgres',
      database: 'lexiflow_test'
    });

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          database: 'lexiflow_test',
          entities: [MyEntity],
          synchronize: true
        }),
        TypeOrmModule.forFeature([MyEntity])
      ],
      providers: [MyService]
    }).compile();

    service = module.get<MyService>(MyService);
  });

  afterAll(async () => {
    await dbHelper.closeConnection();
  });

  beforeEach(async () => {
    await dbHelper.cleanDatabase();
  });

  it('should create and retrieve from database', async () => {
    const data = { name: 'Test' };

    const created = await service.create(data);
    expect(created).toHaveProperty('id');

    const retrieved = await service.findOne(created.id);
    expect(retrieved).toMatchObject(data);
  });
});
```

### E2E Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('My Feature (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Get auth token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@lexiflow.com', password: 'admin123' });
    authToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /my-endpoint', () => {
    it('should create resource', () => {
      return request(app.getHttpServer())
        .post('/my-endpoint')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Test');
        });
    });

    it('should return 401 without auth', () => {
      return request(app.getHttpServer())
        .post('/my-endpoint')
        .send({ name: 'Test' })
        .expect(401);
    });

    it('should return 400 with invalid data', () => {
      return request(app.getHttpServer())
        .post('/my-endpoint')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });
});
```

### DTO Validation Test Template

```typescript
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateMyDto } from '../create-my.dto';

describe('CreateMyDto', () => {
  it('should pass with valid data', async () => {
    const dto = plainToInstance(CreateMyDto, {
      name: 'Valid Name',
      email: 'test@example.com'
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail when name is missing', async () => {
    const dto = plainToInstance(CreateMyDto, {
      email: 'test@example.com'
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });

  it('should fail when email is invalid', async () => {
    const dto = plainToInstance(CreateMyDto, {
      name: 'Test',
      email: 'invalid-email'
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
```

---

## 🎯 Testing Best Practices

### DO ✅

1. **Use test utilities** - Don't recreate mocks
2. **Clear mocks** - Call `jest.clearAllMocks()` in `beforeEach`
3. **Test errors** - Don't just test happy paths
4. **Meaningful names** - Describe what you're testing
5. **AAA Pattern** - Arrange, Act, Assert
6. **One assertion concept per test** - Keep tests focused
7. **Use factories** - MockFactory, TestDataFactory
8. **Mock at boundaries** - Services, repositories, external APIs
9. **Verify mock calls** - Use `toHaveBeenCalledWith`
10. **Test edge cases** - Empty arrays, null, undefined, large data

### DON'T ❌

1. **Don't skip tests** - Fix or delete, don't skip
2. **Don't use real external services** - Always mock
3. **Don't test implementation details** - Test behavior
4. **Don't share state** - Each test should be independent
5. **Don't use setTimeout** - Mock timers with jest.useFakeTimers()
6. **Don't commit .only tests** - Used for debugging only
7. **Don't hardcode IDs** - Use faker or MockFactory
8. **Don't test framework code** - Trust NestJS, TypeORM
9. **Don't write flaky tests** - Make tests deterministic
10. **Don't ignore coverage warnings** - Address them

---

## 📊 Coverage Requirements

### Minimum Coverage by Component

| Component Type | Minimum Coverage | Current | Status |
|----------------|-----------------|---------|--------|
| Services | 80% | 17.7% | 🔴 |
| Controllers | 85% | 23.5% | 🔴 |
| Resolvers | 90% | 0% | 🔴 |
| Gateways | 90% | 0% | 🔴 |
| Guards | 90% | 17.2% | 🔴 |
| Interceptors | 85% | 17.2% | 🔴 |
| Pipes | 85% | 17.2% | 🔴 |
| Middleware | 90% | 0% | 🔴 |
| Filters | 90% | 0% | 🔴 |
| DTOs | 100% validation | 0% | 🔴 |

---

## 🚀 Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test

# Watch mode (during development)
npm run test:watch

# With coverage
npm run test:cov

# Specific file
npm test -- my.service.spec.ts

# Specific describe block
npm test -- -t "MyService findOne"
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration

# With coverage
npm run test:integration -- --coverage
```

### E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Specific E2E suite
npm run test:e2e -- auth.e2e-spec.ts
```

### All Tests
```bash
# Run everything
npm run test:all

# CI mode (for pipeline)
npm run test:ci
```

---

## 🔍 Debugging Tests

### Debug in VS Code

Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "${file}"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Debug from CLI
```bash
npm run test:debug -- my.spec.ts
# Open chrome://inspect
```

### Common Issues

1. **Test timeout** - Increase timeout: `jest.setTimeout(10000)`
2. **Module not found** - Check moduleNameMapper in jest.config.js
3. **Async errors** - Always await or return promises
4. **Mock not working** - Clear mocks in beforeEach
5. **Database errors** - Check test database connection

---

## 📚 Additional Resources

- **Full Audit Report:** `TESTING_AUDIT_REPORT.json`
- **Audit Summary:** `TESTING_AUDIT_SUMMARY.md`
- **Jest Docs:** https://jestjs.io/
- **NestJS Testing:** https://docs.nestjs.com/fundamentals/testing
- **Testing Library:** https://testing-library.com/

---

## 🎓 Training Resources

### Recommended Learning Path

1. **Week 1:** Jest basics, mocking, assertions
2. **Week 2:** NestJS testing patterns, dependency injection
3. **Week 3:** Integration testing, database testing
4. **Week 4:** E2E testing, advanced patterns

### Internal Resources

- Test utilities: `/src/test-utils/`
- Example tests: `/src/auth/auth.service.spec.ts`
- E2E examples: `/test/auth.e2e-spec.ts`
- Mock factories: `/src/test-utils/mock-factory.ts`

---

## ✅ Pre-Commit Checklist

Before pushing code:

- [ ] All tests pass (`npm test`)
- [ ] Coverage meets threshold (`npm run test:cov`)
- [ ] No skipped tests (`.skip`, `xit`)
- [ ] No focused tests (`.only`, `fit`)
- [ ] New code has tests
- [ ] Integration tests pass (if applicable)
- [ ] E2E tests pass (if applicable)

---

## 🆘 Get Help

**Questions about testing?**
1. Check this guide first
2. Review example tests in codebase
3. Consult testing audit reports
4. Ask in team chat/standup

**Found a bug in test infrastructure?**
1. Document the issue
2. Create ticket
3. Discuss in team meeting

---

**Remember: Tests are production code. Treat them with the same care as your application code!**

---

Last Updated: December 27, 2025
Version: 1.0
Status: Active - Use This Guide!
