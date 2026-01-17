import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../../src/app.module";
import { setupTestDatabase, teardownTestDatabase } from "../setup";

describe("RulesEngineController (e2e)", () => {
  let app: INestApplication;
  let ruleId: string;

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

  it("/rules-engine (POST) - create rule", () => {
    return request(app.getHttpServer())
      .post("/rules-engine")
      .send({
        name: "Test Rule",
        description: "Test rule description",
        category: "Compliance",
        conditions: { field: "status", operator: "equals", value: "Active" },
        actions: { type: "notify", message: "Rule triggered" },
        priority: 10,
        isActive: true,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty("id");
        expect(res.body.name).toBe("Test Rule");
        ruleId = res.body.id;
      });
  });

  it("/rules-engine (GET) - get all rules", () => {
    return request(app.getHttpServer())
      .get("/rules-engine")
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("data");
        expect(res.body).toHaveProperty("total");
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });

  it("/rules-engine/categories (GET) - get categories", () => {
    return request(app.getHttpServer())
      .get("/rules-engine/categories")
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it("/rules-engine/execute (POST) - execute rule", () => {
    return request(app.getHttpServer())
      .post("/rules-engine/execute")
      .send({
        ruleId,
        context: { caseId: "123", status: "Active" },
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("success");
        expect(res.body.ruleId).toBe(ruleId);
      });
  });

  it("/rules-engine/:id (GET) - get rule by id", () => {
    return request(app.getHttpServer())
      .get(`/rules-engine/${ruleId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(ruleId);
        expect(res.body.name).toBe("Test Rule");
      });
  });

  it("/rules-engine/:id (PUT) - update rule", () => {
    return request(app.getHttpServer())
      .put(`/rules-engine/${ruleId}`)
      .send({ priority: 20 })
      .expect(200)
      .expect((res) => {
        expect(res.body.priority).toBe(20);
      });
  });

  it("/rules-engine/:id (DELETE) - delete rule", () => {
    return request(app.getHttpServer())
      .delete(`/rules-engine/${ruleId}`)
      .expect(200);
  });
});
