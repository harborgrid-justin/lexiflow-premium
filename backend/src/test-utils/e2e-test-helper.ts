import { INestApplication } from '@nestjs/common';
import request from 'supertest';

interface AuthResponse {
  body: {
    data: {
      accessToken: string;
    };
  };
}

export class E2ETestHelper {
  /**
   * Authenticate and get JWT token
   */
  static async getAuthToken(
    app: INestApplication,
    email: string = 'admin@lexiflow.com',
    password: string = 'Admin123!',
  ): Promise<string> {
    const server = app.getHttpServer();
    const response = (await request(server)
      .post('/auth/login')
      .send({ email, password })
      .expect(200)) as unknown as AuthResponse;

    return response.body.data.accessToken;
  }

  /**
   * Make authenticated GET request
   */
  static async authenticatedGet(
    app: INestApplication,
    path: string,
    token: string,
  ): Promise<any> {
    const server = app.getHttpServer();
    return request(server)
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
    body: unknown,
  ): Promise<any> {
    const server = app.getHttpServer();
    return request(server)
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
    body: unknown,
  ): Promise<any> {
    const server = app.getHttpServer();
    return request(server)
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
  ): Promise<any> {
    const server = app.getHttpServer();
    return request(server)
      .delete(path)
      .set('Authorization', `Bearer ${token}`);
  }

  /**
   * Assert standard response format
   */
  static assertStandardResponse(response: any, expectedSuccess: boolean = true): void {
    expect(response.body).toHaveProperty('success', expectedSuccess);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('timestamp');
  }

  /**
   * Assert paginated response format
   */
  static assertPaginatedResponse(response: any): void {
    const responseBody = response.body as unknown as {
      data: {
        data: unknown[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
    expect(responseBody.data).toHaveProperty('data');
    expect(responseBody.data).toHaveProperty('total');
    expect(responseBody.data).toHaveProperty('page');
    expect(responseBody.data).toHaveProperty('limit');
    expect(responseBody.data).toHaveProperty('totalPages');
    expect(Array.isArray(responseBody.data.data)).toBe(true);
  }

  /**
   * Assert validation error response
   */
  static assertValidationError(response: any, expectedErrors: number): void {
    const responseBody = response.body as unknown as {
      success: boolean;
      error: {
        errors: unknown[];
      };
    };
    expect(response.status).toBe(400);
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody.error).toHaveProperty('errors');
    expect(responseBody.error.errors.length).toBeGreaterThanOrEqual(
      expectedErrors,
    );
  }

  /**
   * Assert unauthorized response
   */
  static assertUnauthorized(response: Response): void {
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('success', false);
  }

  /**
   * Assert not found response
   */
  static assertNotFound(response: Response): void {
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
  }
}
