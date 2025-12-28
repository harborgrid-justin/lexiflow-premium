import { INestApplication } from '@nestjs/common';
// TODO: Install @types/supertest: npm i --save-dev @types/supertest
import request from 'supertest';
import type { Response, Test } from 'supertest';

interface AuthResponse {
  body: {
    data: {
      accessToken: string;
    };
  };
}

interface RequestMethods {
  post: (url: string) => Test;
  get: (url: string) => Test;
  put: (url: string) => Test;
  delete: (url: string) => Test;
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
    const testRequest = request(server) as unknown as RequestMethods;
    const postRequest = testRequest.post('/auth/login') as unknown as Test;
    const sendRequest = postRequest.send({ email, password }) as unknown as Test;
    const response = (await sendRequest.expect(200)) as unknown as AuthResponse;

    return response.body.data.accessToken;
  }

  /**
   * Make authenticated GET request
   */
  static async authenticatedGet(
    app: INestApplication,
    path: string,
    token: string,
  ): Promise<Response> {
    const server = app.getHttpServer();
    const testRequest = request(server) as unknown as RequestMethods;
    const getRequest = testRequest.get(path) as unknown as Test;
    const result = getRequest.set('Authorization', `Bearer ${token}`) as unknown as Test;
    return result as unknown as Promise<Response>;
  }

  /**
   * Make authenticated POST request
   */
  static async authenticatedPost(
    app: INestApplication,
    path: string,
    token: string,
    body: unknown,
  ): Promise<Response> {
    const server = app.getHttpServer();
    const testRequest = request(server) as unknown as RequestMethods;
    const postRequest = testRequest.post(path) as unknown as Test;
    const authRequest = postRequest.set('Authorization', `Bearer ${token}`) as unknown as Test;
    const result = authRequest.send(body) as unknown as Test;
    return result as unknown as Promise<Response>;
  }

  /**
   * Make authenticated PUT request
   */
  static async authenticatedPut(
    app: INestApplication,
    path: string,
    token: string,
    body: unknown,
  ): Promise<Response> {
    const server = app.getHttpServer();
    const testRequest = request(server) as unknown as RequestMethods;
    const putRequest = testRequest.put(path) as unknown as Test;
    const authRequest = putRequest.set('Authorization', `Bearer ${token}`) as unknown as Test;
    const result = authRequest.send(body) as unknown as Test;
    return result as unknown as Promise<Response>;
  }

  /**
   * Make authenticated DELETE request
   */
  static async authenticatedDelete(
    app: INestApplication,
    path: string,
    token: string,
  ): Promise<Response> {
    const server = app.getHttpServer();
    const testRequest = request(server) as unknown as RequestMethods;
    const deleteRequest = testRequest.delete(path) as unknown as Test;
    const result = deleteRequest.set('Authorization', `Bearer ${token}`) as unknown as Test;
    return result as unknown as Promise<Response>;
  }

  /**
   * Assert standard response format
   */
  static assertStandardResponse(response: Response, expectedSuccess: boolean = true): void {
    expect(response.body).toHaveProperty('success', expectedSuccess);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('timestamp');
  }

  /**
   * Assert paginated response format
   */
  static assertPaginatedResponse(response: Response): void {
    const responseBody = response.body as {
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
  static assertValidationError(response: Response, expectedErrors: number): void {
    const responseBody = response.body as {
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
