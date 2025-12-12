import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Cases (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let createdCaseId: string;

  const testUser = {
    email: 'attorney@lexiflow.com',
    password: 'AttorneyPass123!',
    firstName: 'Test',
    lastName: 'Attorney',
    role: 'ATTORNEY',
  };

  const testCase = {
    caseNumber: 'CASE-2025-001',
    title: 'Smith vs. Jones Corporation',
    description: 'Civil litigation case for breach of contract',
    caseType: 'CIVIL',
    status: 'OPEN',
    priority: 'HIGH',
    courtName: 'Superior Court of California',
    jurisdiction: 'California',
    filingDate: new Date().toISOString(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Register and login test user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
    await app.close();
  });

  describe('POST /cases', () => {
    it('should create a new case', () => {
      return request(app.getHttpServer())
        .post('/cases')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testCase)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('caseNumber', testCase.caseNumber);
          expect(res.body).toHaveProperty('title', testCase.title);
          expect(res.body).toHaveProperty('caseType', testCase.caseType);
          createdCaseId = res.body.id;
        });
    });

    it('should fail to create case without authentication', () => {
      return request(app.getHttpServer())
        .post('/cases')
        .send(testCase)
        .expect(401);
    });

    it('should fail to create case with duplicate case number', () => {
      return request(app.getHttpServer())
        .post('/cases')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testCase)
        .expect(409);
    });

    it('should fail to create case with invalid data', () => {
      return request(app.getHttpServer())
        .post('/cases')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          caseNumber: 'INVALID',
          // Missing required fields
        })
        .expect(400);
    });
  });

  describe('GET /cases', () => {
    it('should get all cases', () => {
      return request(app.getHttpServer())
        .get('/cases')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should filter cases by status', () => {
      return request(app.getHttpServer())
        .get('/cases?status=OPEN')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((c) => {
            expect(c.status).toBe('OPEN');
          });
        });
    });

    it('should filter cases by case type', () => {
      return request(app.getHttpServer())
        .get('/cases?caseType=CIVIL')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((c) => {
            expect(c.caseType).toBe('CIVIL');
          });
        });
    });

    it('should search cases by title', () => {
      return request(app.getHttpServer())
        .get('/cases?search=Smith')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('GET /cases/:id', () => {
    it('should get a case by id', () => {
      return request(app.getHttpServer())
        .get(`/cases/${createdCaseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', createdCaseId);
          expect(res.body).toHaveProperty('caseNumber', testCase.caseNumber);
        });
    });

    it('should return 404 for non-existent case', () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .get(`/cases/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /cases/:id', () => {
    it('should update a case', () => {
      return request(app.getHttpServer())
        .patch(`/cases/${createdCaseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'IN_PROGRESS');
          expect(res.body).toHaveProperty('priority', 'MEDIUM');
        });
    });

    it('should fail to update with invalid data', () => {
      return request(app.getHttpServer())
        .patch(`/cases/${createdCaseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'INVALID_STATUS',
        })
        .expect(400);
    });
  });

  describe('DELETE /cases/:id', () => {
    it('should delete a case', () => {
      return request(app.getHttpServer())
        .delete(`/cases/${createdCaseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should return 404 when deleting non-existent case', () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .delete(`/cases/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Case Statistics', () => {
    it('GET /cases/stats/summary - should get case statistics', () => {
      return request(app.getHttpServer())
        .get('/cases/stats/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalCases');
          expect(res.body).toHaveProperty('byStatus');
          expect(res.body).toHaveProperty('byType');
        });
    });
  });
});
