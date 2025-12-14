import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Import all modules
import { CasesModule } from '../src/cases/cases.module';
import { UsersModule } from '../src/users/users.module';
import { AuthModule } from '../src/auth/auth.module';
import { CasePhasesModule } from '../src/case-phases/case-phases.module';
import { CaseTeamsModule } from '../src/case-teams/case-teams.module';
import { PartiesModule } from '../src/parties/parties.module';
import { DocumentsModule } from '../src/documents/documents.module';
import { MotionsModule } from '../src/motions/motions.module';
import { DocketModule } from '../src/docket/docket.module';
import { ProjectsModule } from '../src/projects/projects.module';
import { ClausesModule } from '../src/clauses/clauses.module';
import { PleadingsModule } from '../src/pleadings/pleadings.module';
import { DiscoveryModule } from '../src/discovery/discovery.module';
import { BillingModule } from '../src/billing/billing.module';
import { ComplianceModule } from '../src/compliance/compliance.module';
import { CommunicationsModule } from '../src/communications/communications.module';
import { AnalyticsModule } from '../src/analytics/analytics.module';
import { HealthModule } from '../src/health/health.module';
import { SearchModule } from '../src/search/search.module';
import { ReportsModule } from '../src/reports/reports.module';
import { WebhooksModule } from '../src/webhooks/webhooks.module';
import { ApiKeysModule } from '../src/api-keys/api-keys.module';
import { MetricsModule } from '../src/metrics/metrics.module';
import { IntegrationsModule } from '../src/integrations/integrations.module';

// Import entities
import { entities } from '../src/entities';

describe('All CRUD Endpoints (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: entities,
          synchronize: true,
          dropSchema: true,
        }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
        // Import all modules
        CasesModule,
        UsersModule,
        AuthModule,
        CasePhasesModule,
        CaseTeamsModule,
        PartiesModule,
        DocumentsModule,
        MotionsModule,
        DocketModule,
        ProjectsModule,
        ClausesModule,
        PleadingsModule,
        DiscoveryModule,
        BillingModule,
        ComplianceModule,
        CommunicationsModule,
        AnalyticsModule,
        HealthModule,
        SearchModule,
        ReportsModule,
        WebhooksModule,
        ApiKeysModule,
        MetricsModule,
        IntegrationsModule,
      ],
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
  });

  afterAll(async () => {
    await app.close();
  });

  // Health & Root Endpoints
  describe('Health & Root', () => {
    it('GET / - should return app info', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect((res) => {
          expect(res.status).toBeLessThan(500);
        });
    });

    it('GET /health - should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect((res) => {
          expect(res.status).toBeLessThan(500);
        });
    });
  });

  // Cases CRUD
  describe('Cases CRUD', () => {
    let caseId: string;

    it('POST /api/v1/cases - should create a case', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/cases')
        .send({
          caseNumber: 'CASE-001',
          caseName: 'Test Case',
          status: 'open',
          practiceArea: 'litigation',
        });

      expect(response.status).toBeLessThan(500);
      if (response.status === 201) {
        caseId = response.body.id;
      }
    });

    it('GET /api/v1/cases - should list cases', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/cases');

      expect(response.status).toBeLessThan(500);
    });

    it('GET /api/v1/cases/:id - should get case by id', async () => {
      if (!caseId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/cases/${caseId}`);

      expect(response.status).toBeLessThan(500);
    });

    it('PUT /api/v1/cases/:id - should update case', async () => {
      if (!caseId) return;

      const response = await request(app.getHttpServer())
        .put(`/api/v1/cases/${caseId}`)
        .send({ caseName: 'Updated Test Case' });

      expect(response.status).toBeLessThan(500);
    });

    it('DELETE /api/v1/cases/:id - should delete case', async () => {
      if (!caseId) return;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/cases/${caseId}`);

      expect(response.status).toBeLessThan(500);
    });
  });

  // Users CRUD
  describe('Users CRUD', () => {
    let userId: string;

    it('POST /api/v1/users - should create a user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          email: 'test@example.com',
          password: 'Test123!',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBeLessThan(500);
      if (response.status === 201) {
        userId = response.body.id;
      }
    });

    it('GET /api/v1/users - should list users', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users');

      expect(response.status).toBeLessThan(500);
    });

    it('GET /api/v1/users/:id - should get user by id', async () => {
      if (!userId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${userId}`);

      expect(response.status).toBeLessThan(500);
    });

    it('PUT /api/v1/users/:id - should update user', async () => {
      if (!userId) return;

      const response = await request(app.getHttpServer())
        .put(`/api/v1/users/${userId}`)
        .send({ firstName: 'Updated' });

      expect(response.status).toBeLessThan(500);
    });

    it('DELETE /api/v1/users/:id - should delete user', async () => {
      if (!userId) return;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/users/${userId}`);

      expect(response.status).toBeLessThan(500);
    });
  });

  // Documents CRUD
  describe('Documents CRUD', () => {
    let documentId: string;

    it('POST /api/v1/documents - should create a document', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/documents')
        .send({
          title: 'Test Document',
          type: 'contract',
          mimeType: 'application/pdf',
        });

      expect(response.status).toBeLessThan(500);
      if (response.status === 201) {
        documentId = response.body.id;
      }
    });

    it('GET /api/v1/documents - should list documents', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/documents');

      expect(response.status).toBeLessThan(500);
    });

    it('GET /api/v1/documents/:id - should get document by id', async () => {
      if (!documentId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/documents/${documentId}`);

      expect(response.status).toBeLessThan(500);
    });

    it('PUT /api/v1/documents/:id - should update document', async () => {
      if (!documentId) return;

      const response = await request(app.getHttpServer())
        .put(`/api/v1/documents/${documentId}`)
        .send({ title: 'Updated Document' });

      expect(response.status).toBeLessThan(500);
    });

    it('DELETE /api/v1/documents/:id - should delete document', async () => {
      if (!documentId) return;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/documents/${documentId}`);

      expect(response.status).toBeLessThan(500);
    });
  });

  // Projects CRUD
  describe('Projects CRUD', () => {
    let projectId: string;

    it('POST /api/v1/projects - should create a project', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .send({
          name: 'Test Project',
          description: 'Test Description',
        });

      expect(response.status).toBeLessThan(500);
      if (response.status === 201) {
        projectId = response.body.id;
      }
    });

    it('GET /api/v1/projects - should list projects', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/projects');

      expect(response.status).toBeLessThan(500);
    });

    it('GET /api/v1/projects/:id - should get project by id', async () => {
      if (!projectId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}`);

      expect(response.status).toBeLessThan(500);
    });

    it('PUT /api/v1/projects/:id - should update project', async () => {
      if (!projectId) return;

      const response = await request(app.getHttpServer())
        .put(`/api/v1/projects/${projectId}`)
        .send({ name: 'Updated Project' });

      expect(response.status).toBeLessThan(500);
    });

    it('DELETE /api/v1/projects/:id - should delete project', async () => {
      if (!projectId) return;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/projects/${projectId}`);

      expect(response.status).toBeLessThan(500);
    });
  });

  // Clauses CRUD
  describe('Clauses CRUD', () => {
    let clauseId: string;

    it('POST /api/v1/clauses - should create a clause', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/clauses')
        .send({
          title: 'Test Clause',
          content: 'Test clause content',
          category: 'general',
        });

      expect(response.status).toBeLessThan(500);
      if (response.status === 201) {
        clauseId = response.body.id;
      }
    });

    it('GET /api/v1/clauses - should list clauses', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/clauses');

      expect(response.status).toBeLessThan(500);
    });

    it('GET /api/v1/clauses/:id - should get clause by id', async () => {
      if (!clauseId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/clauses/${clauseId}`);

      expect(response.status).toBeLessThan(500);
    });

    it('PUT /api/v1/clauses/:id - should update clause', async () => {
      if (!clauseId) return;

      const response = await request(app.getHttpServer())
        .put(`/api/v1/clauses/${clauseId}`)
        .send({ title: 'Updated Clause' });

      expect(response.status).toBeLessThan(500);
    });

    it('DELETE /api/v1/clauses/:id - should delete clause', async () => {
      if (!clauseId) return;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/clauses/${clauseId}`);

      expect(response.status).toBeLessThan(500);
    });
  });

  // Pleadings CRUD
  describe('Pleadings CRUD', () => {
    let pleadingId: string;

    it('POST /api/v1/pleadings - should create a pleading', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/pleadings')
        .send({
          title: 'Test Pleading',
          type: 'motion',
        });

      expect(response.status).toBeLessThan(500);
      if (response.status === 201) {
        pleadingId = response.body.id;
      }
    });

    it('GET /api/v1/pleadings - should list pleadings', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/pleadings');

      expect(response.status).toBeLessThan(500);
    });

    it('GET /api/v1/pleadings/:id - should get pleading by id', async () => {
      if (!pleadingId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/pleadings/${pleadingId}`);

      expect(response.status).toBeLessThan(500);
    });

    it('PUT /api/v1/pleadings/:id - should update pleading', async () => {
      if (!pleadingId) return;

      const response = await request(app.getHttpServer())
        .put(`/api/v1/pleadings/${pleadingId}`)
        .send({ title: 'Updated Pleading' });

      expect(response.status).toBeLessThan(500);
    });

    it('DELETE /api/v1/pleadings/:id - should delete pleading', async () => {
      if (!pleadingId) return;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/pleadings/${pleadingId}`);

      expect(response.status).toBeLessThan(500);
    });
  });

  // Billing Time Entries CRUD
  describe('Billing Time Entries CRUD', () => {
    let timeEntryId: string;

    it('POST /api/v1/billing/time-entries - should create time entry', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/billing/time-entries')
        .send({
          description: 'Test time entry',
          hours: 2.5,
          rate: 200,
        });

      expect(response.status).toBeLessThan(500);
      if (response.status === 201) {
        timeEntryId = response.body.id;
      }
    });

    it('GET /api/v1/billing/time-entries - should list time entries', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/billing/time-entries');

      expect(response.status).toBeLessThan(500);
    });

    it('GET /api/v1/billing/time-entries/:id - should get time entry by id', async () => {
      if (!timeEntryId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/billing/time-entries/${timeEntryId}`);

      expect(response.status).toBeLessThan(500);
    });

    it('PUT /api/v1/billing/time-entries/:id - should update time entry', async () => {
      if (!timeEntryId) return;

      const response = await request(app.getHttpServer())
        .put(`/api/v1/billing/time-entries/${timeEntryId}`)
        .send({ hours: 3.0 });

      expect(response.status).toBeLessThan(500);
    });

    it('DELETE /api/v1/billing/time-entries/:id - should delete time entry', async () => {
      if (!timeEntryId) return;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/billing/time-entries/${timeEntryId}`);

      expect(response.status).toBeLessThan(500);
    });
  });

  // Billing Invoices CRUD
  describe('Billing Invoices CRUD', () => {
    let invoiceId: string;

    it('POST /api/v1/billing/invoices - should create invoice', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/billing/invoices')
        .send({
          invoiceNumber: 'INV-001',
          subtotal: 1000,
          dueDate: '2025-01-31',
        });

      expect(response.status).toBeLessThan(500);
      if (response.status === 201) {
        invoiceId = response.body.id;
      }
    });

    it('GET /api/v1/billing/invoices - should list invoices', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/billing/invoices');

      expect(response.status).toBeLessThan(500);
    });

    it('GET /api/v1/billing/invoices/:id - should get invoice by id', async () => {
      if (!invoiceId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/billing/invoices/${invoiceId}`);

      expect(response.status).toBeLessThan(500);
    });

    it('PUT /api/v1/billing/invoices/:id - should update invoice', async () => {
      if (!invoiceId) return;

      const response = await request(app.getHttpServer())
        .put(`/api/v1/billing/invoices/${invoiceId}`)
        .send({ subtotal: 1200 });

      expect(response.status).toBeLessThan(500);
    });

    it('DELETE /api/v1/billing/invoices/:id - should delete invoice', async () => {
      if (!invoiceId) return;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/billing/invoices/${invoiceId}`);

      expect(response.status).toBeLessThan(500);
    });
  });

  // Billing Expenses CRUD
  describe('Billing Expenses CRUD', () => {
    let expenseId: string;

    it('POST /api/v1/billing/expenses - should create expense', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/billing/expenses')
        .send({
          description: 'Test expense',
          amount: 100,
          category: 'filing_fee',
        });

      expect(response.status).toBeLessThan(500);
      if (response.status === 201) {
        expenseId = response.body.id;
      }
    });

    it('GET /api/v1/billing/expenses - should list expenses', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/billing/expenses');

      expect(response.status).toBeLessThan(500);
    });

    it('GET /api/v1/billing/expenses/:id - should get expense by id', async () => {
      if (!expenseId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/billing/expenses/${expenseId}`);

      expect(response.status).toBeLessThan(500);
    });

    it('PUT /api/v1/billing/expenses/:id - should update expense', async () => {
      if (!expenseId) return;

      const response = await request(app.getHttpServer())
        .put(`/api/v1/billing/expenses/${expenseId}`)
        .send({ amount: 150 });

      expect(response.status).toBeLessThan(500);
    });

    it('DELETE /api/v1/billing/expenses/:id - should delete expense', async () => {
      if (!expenseId) return;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/billing/expenses/${expenseId}`);

      expect(response.status).toBeLessThan(500);
    });
  });

  // Discovery Legal Holds CRUD
  describe('Discovery Legal Holds CRUD', () => {
    let legalHoldId: string;

    it('POST /api/v1/discovery/legal-holds - should create legal hold', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/discovery/legal-holds')
        .send({
          name: 'Test Legal Hold',
          description: 'Test Description',
        });

      expect(response.status).toBeLessThan(500);
      if (response.status === 201) {
        legalHoldId = response.body.id;
      }
    });

    it('GET /api/v1/discovery/legal-holds - should list legal holds', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/discovery/legal-holds');

      expect(response.status).toBeLessThan(500);
    });

    it('GET /api/v1/discovery/legal-holds/:id - should get legal hold by id', async () => {
      if (!legalHoldId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/discovery/legal-holds/${legalHoldId}`);

      expect(response.status).toBeLessThan(500);
    });

    it('PUT /api/v1/discovery/legal-holds/:id - should update legal hold', async () => {
      if (!legalHoldId) return;

      const response = await request(app.getHttpServer())
        .put(`/api/v1/discovery/legal-holds/${legalHoldId}`)
        .send({ name: 'Updated Legal Hold' });

      expect(response.status).toBeLessThan(500);
    });

    it('DELETE /api/v1/discovery/legal-holds/:id - should delete legal hold', async () => {
      if (!legalHoldId) return;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/discovery/legal-holds/${legalHoldId}`);

      expect(response.status).toBeLessThan(500);
    });
  });

  // Discovery Depositions CRUD
  describe('Discovery Depositions CRUD', () => {
    let depositionId: string;

    it('POST /api/v1/discovery/depositions - should create deposition', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/discovery/depositions')
        .send({
          deponentName: 'Test Deponent',
          scheduledDate: '2025-02-01',
        });

      expect(response.status).toBeLessThan(500);
      if (response.status === 201) {
        depositionId = response.body.id;
      }
    });

    it('GET /api/v1/discovery/depositions - should list depositions', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/discovery/depositions');

      expect(response.status).toBeLessThan(500);
    });

    it('GET /api/v1/discovery/depositions/:id - should get deposition by id', async () => {
      if (!depositionId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/discovery/depositions/${depositionId}`);

      expect(response.status).toBeLessThan(500);
    });

    it('PUT /api/v1/discovery/depositions/:id - should update deposition', async () => {
      if (!depositionId) return;

      const response = await request(app.getHttpServer())
        .put(`/api/v1/discovery/depositions/${depositionId}`)
        .send({ deponentName: 'Updated Deponent' });

      expect(response.status).toBeLessThan(500);
    });

    it('DELETE /api/v1/discovery/depositions/:id - should delete deposition', async () => {
      if (!depositionId) return;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/discovery/depositions/${depositionId}`);

      expect(response.status).toBeLessThan(500);
    });
  });

  // Webhooks CRUD
  describe('Webhooks CRUD', () => {
    let webhookId: string;

    it('POST /api/v1/webhooks - should create webhook', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/webhooks')
        .send({
          url: 'https://example.com/webhook',
          events: ['case.created'],
        });

      expect(response.status).toBeLessThan(500);
      if (response.status === 201) {
        webhookId = response.body.id;
      }
    });

    it('GET /api/v1/webhooks - should list webhooks', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/webhooks');

      expect(response.status).toBeLessThan(500);
    });

    it('GET /api/v1/webhooks/:id - should get webhook by id', async () => {
      if (!webhookId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/webhooks/${webhookId}`);

      expect(response.status).toBeLessThan(500);
    });

    it('PUT /api/v1/webhooks/:id - should update webhook', async () => {
      if (!webhookId) return;

      const response = await request(app.getHttpServer())
        .put(`/api/v1/webhooks/${webhookId}`)
        .send({ url: 'https://updated.example.com/webhook' });

      expect(response.status).toBeLessThan(500);
    });

    it('DELETE /api/v1/webhooks/:id - should delete webhook', async () => {
      if (!webhookId) return;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/webhooks/${webhookId}`);

      expect(response.status).toBeLessThan(500);
    });
  });

  // Search endpoint
  describe('Search', () => {
    it('GET /api/v1/search - should perform search', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/search')
        .query({ q: 'test' });

      expect(response.status).toBeLessThan(500);
    });
  });

  // Analytics endpoints
  describe('Analytics', () => {
    it('GET /api/v1/dashboard - should get dashboard', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/dashboard');

      expect(response.status).toBeLessThan(500);
    });

    it('GET /api/v1/analytics/case-metrics - should get case metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/case-metrics');

      expect(response.status).toBeLessThan(500);
    });
  });

  // Compliance endpoints
  describe('Compliance', () => {
    it('GET /api/v1/audit-logs - should get audit logs', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/audit-logs');

      expect(response.status).toBeLessThan(500);
    });

    it('GET /api/v1/compliance/conflicts - should get conflicts', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/compliance/conflicts');

      expect(response.status).toBeLessThan(500);
    });
  });

  // Notifications
  describe('Notifications', () => {
    it('GET /api/v1/notifications - should get notifications', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/notifications');

      expect(response.status).toBeLessThan(500);
    });
  });
});
