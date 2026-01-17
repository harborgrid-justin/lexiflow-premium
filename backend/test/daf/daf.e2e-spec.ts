import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../../src/app.module";
import { setupTestDatabase, teardownTestDatabase } from "../setup";

describe("DafController (e2e)", () => {
  let app: INestApplication;
  let operationId: string;

  beforeAll(async () => {
    await setupTestDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  it("/daf (POST) - create operation", () => {
    return request(app.getHttpServer())
      .post("/daf")
      .send({
        title: "Test Operation",
        description: "Test operation description",
        operationType: "Training",
        classification: "Unclassified",
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty("id");
        expect(res.body.title).toBe("Test Operation");
        operationId = res.body.id;
      });
  });

  it("/daf (GET) - get all operations", () => {
    return request(app.getHttpServer())
      .get("/daf")
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("data");
        expect(res.body).toHaveProperty("total");
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });

  it("/daf/dashboard (GET) - get dashboard", () => {
    return request(app.getHttpServer())
      .get("/daf/dashboard")
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("totalOperations");
        expect(res.body).toHaveProperty("activeOperations");
      });
  });

  it("/daf/compliance (GET) - get compliance status", () => {
    return request(app.getHttpServer())
      .get("/daf/compliance")
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("complianceRate");
        expect(res.body).toHaveProperty("auditsPassed");
      });
  });

  it("/daf/:id (GET) - get operation by id", () => {
    return request(app.getHttpServer())
      .get(`/daf/${operationId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(operationId);
        expect(res.body.title).toBe("Test Operation");
      });
  });

  it("/daf/:id (PUT) - update operation", () => {
    return request(app.getHttpServer())
      .put(`/daf/${operationId}`)
      .send({ title: "Updated Operation" })
      .expect(200)
      .expect((res) => {
        expect(res.body.title).toBe("Updated Operation");
      });
  });

  it("/daf/:id (DELETE) - delete operation", () => {
    return request(app.getHttpServer())
      .delete(`/daf/${operationId}`)
      .expect(200);
  });
});
