import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { KnowledgeModule } from '../src/knowledge/knowledge.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('KnowledgeController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.TEST_DB_HOST || 'localhost',
          port: parseInt(process.env.TEST_DB_PORT || '5432'),
          username: process.env.TEST_DB_USER || 'test',
          password: process.env.TEST_DB_PASSWORD || 'test',
          database: process.env.TEST_DB_NAME || 'test_db',
          entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
          synchronize: true,
          dropSchema: true,
        }),
        KnowledgeModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/knowledge/articles (GET)', () => {
    it('should return all articles', () => {
      return request(app.getHttpServer())
        .get('/api/v1/knowledge/articles')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter by category', () => {
      return request(app.getHttpServer())
        .get('/api/v1/knowledge/articles?category=Legal')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
        });
    });
  });

  describe('/api/v1/knowledge/articles (POST)', () => {
    it('should create a new article with valid auth', () => {
      const createDto = {
        title: 'E2E Test Article',
        content: 'Test content',
        category: 'General',
        tags: ['test'],
        status: 'published',
      };

      return request(app.getHttpServer())
        .post('/api/v1/knowledge/articles')
        .set('Authorization', 'Bearer valid-token')
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe(createDto.title);
        });
    });

    it('should fail without authentication', () => {
      const createDto = {
        title: 'E2E Test Article',
        content: 'Test content',
      };

      return request(app.getHttpServer())
        .post('/api/v1/knowledge/articles')
        .send(createDto)
        .expect(401);
    });

    it('should fail with invalid data', () => {
      const invalidDto = {
        title: '', // Empty title
      };

      return request(app.getHttpServer())
        .post('/api/v1/knowledge/articles')
        .set('Authorization', 'Bearer valid-token')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/api/v1/knowledge/articles/:id (GET)', () => {
    it('should return a specific article', async () => {
      // First create an article
      const createDto = {
        title: 'Test Article',
        content: 'Test content',
        category: 'General',
        status: 'published',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/knowledge/articles')
        .set('Authorization', 'Bearer valid-token')
        .send(createDto);

      const articleId = createResponse.body.id;

      // Then fetch it
      return request(app.getHttpServer())
        .get(`/api/v1/knowledge/articles/${articleId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(articleId);
          expect(res.body.title).toBe(createDto.title);
        });
    });

    it('should return 404 for non-existent article', () => {
      return request(app.getHttpServer())
        .get('/api/v1/knowledge/articles/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('/api/v1/knowledge/search (GET)', () => {
    it('should search articles', () => {
      return request(app.getHttpServer())
        .get('/api/v1/knowledge/search?q=test')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/api/v1/knowledge/categories (GET)', () => {
    it('should return all categories', () => {
      return request(app.getHttpServer())
        .get('/api/v1/knowledge/categories')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});
