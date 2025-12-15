import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export class E2ETestHelper {
  /**
   * Authenticate and get JWT token
   */
  static async getAuthToken(
    app: INestApplication,
    email: string = 'admin@lexiflow.com',
    password: string = 'Admin123!',
  ): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    return response.body.data.accessToken;
  }

  /**
   * Make authenticated GET request
   */
  static async authenticatedGet(
    app: INestApplication,
    path: string,
    token: string,
  ) {
    return request(app.getHttpServer())
      .get(path)
      .set('Authorization', `Bearer ${token}`);
  }

  /**
   * Make authenticated POST request
   */
  static async authenticatedPost(
    app: INestApplication,
    path: string,
    token: string,
    body: any,
  ) {
    return request(app.getHttpServer())
      .post(path)
      .set('Authorization', `Bearer ${token}`)
      .send(body);
  }

  /**
   * Make authenticated PUT request
   */
  static async authenticatedPut(
    app: INestApplication,
    path: string,
    token: string,
    body: any,
  ) {
    return request(app.getHttpServer())
      .put(path)
      .set('Authorization', `Bearer ${token}`)
      .send(body);
  }

  /**
   * Make authenticated DELETE request
   */
  static async authenticatedDelete(
    app: INestApplication,
    path: string,
    token: string,
  ) {
    return request(app.getHttpServer())
      .delete(path)
      .set('Authorization', `Bearer ${token}`);
  }

  /**
   * Assert standard response format
   */
  static assertStandardResponse(response: any, expectedSuccess: boolean = true) {
    expect(response.body).toHaveProperty('success', expectedSuccess);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('timestamp');
  }

  /**
   * Assert paginated response format
   */
  static assertPaginatedResponse(response: any) {
    expect(response.body.data).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('total');
    expect(response.body.data).toHaveProperty('page');
    expect(response.body.data).toHaveProperty('limit');
    expect(response.body.data).toHaveProperty('totalPages');
    expect(Array.isArray(response.body.data.data)).toBe(true);
  }

  /**
   * Assert validation error response
   */
  static assertValidationError(response: any, expectedErrors: number) {
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('errors');
    expect(response.body.error.errors.length).toBeGreaterThanOrEqual(
      expectedErrors,
    );
  }

  /**
   * Assert unauthorized response
   */
  static assertUnauthorized(response: any) {
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('success', false);
  }

  /**
   * Assert not found response
   */
  static assertNotFound(response: any) {
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
  }
}
