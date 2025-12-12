import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;

  const testUser = {
    email: 'justin@lexiflow.com',
    password: 'SecurePass123!',
    firstName: 'Justin',
    lastName: 'Admin',
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
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
    await app.close();
  });

  describe('/auth/register', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'newuser@lexiflow.com',
          password: 'NewUserPass123!',
          firstName: 'New',
          lastName: 'User',
          role: 'ATTORNEY',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email', 'newuser@lexiflow.com');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should fail to register with duplicate email', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@lexiflow.com',
          password: 'Password123!',
          firstName: 'Duplicate',
          lastName: 'User',
          role: 'ATTORNEY',
        });

      // Duplicate registration
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@lexiflow.com',
          password: 'Password123!',
          firstName: 'Duplicate',
          lastName: 'User',
          role: 'ATTORNEY',
        })
        .expect(409);
    });

    it('should fail to register with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
          firstName: 'Invalid',
          lastName: 'Email',
          role: 'ATTORNEY',
        })
        .expect(400);
    });

    it('should fail to register with weak password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'weakpass@lexiflow.com',
          password: '123',
          firstName: 'Weak',
          lastName: 'Password',
          role: 'ATTORNEY',
        })
        .expect(400);
    });
  });

  describe('/auth/login', () => {
    beforeAll(async () => {
      // Create a test user for login tests
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(testUser.email);
          authToken = res.body.access_token;
        });
    });

    it('should fail to login with invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should fail to login with non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@lexiflow.com',
          password: 'Password123!',
        })
        .expect(401);
    });
  });

  describe('/auth/profile', () => {
    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('email', testUser.email);
          expect(res.body).toHaveProperty('firstName', testUser.firstName);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should fail to get profile without token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should fail to get profile with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/auth/refresh', () => {
    it('should refresh access token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
        });
    });
  });

  describe('/auth/logout', () => {
    it('should logout successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
