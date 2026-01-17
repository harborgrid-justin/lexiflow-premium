import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../../src/app.module";
import { setupTestDatabase, teardownTestDatabase } from "../setup";

describe("RealEstateController (e2e)", () => {
  let app: INestApplication;
  let propertyId: string;

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

  it("/real-estate (POST) - create property", () => {
    return request(app.getHttpServer())
      .post("/real-estate")
      .send({
        name: "Test Building",
        rpuid: "RPUID-001",
        address: "123 Main St, Test City",
        assessedValue: 500000,
        propertyType: "Commercial",
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty("id");
        expect(res.body.name).toBe("Test Building");
        propertyId = res.body.id;
      });
  });

  it("/real-estate (GET) - get all properties", () => {
    return request(app.getHttpServer())
      .get("/real-estate")
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("data");
        expect(res.body).toHaveProperty("total");
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });

  it("/real-estate/portfolio-summary (GET) - get portfolio summary", () => {
    return request(app.getHttpServer())
      .get("/real-estate/portfolio-summary")
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("totalProperties");
        expect(res.body).toHaveProperty("totalValue");
      });
  });

  it("/real-estate/:id (GET) - get property by id", () => {
    return request(app.getHttpServer())
      .get(`/real-estate/${propertyId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(propertyId);
        expect(res.body.name).toBe("Test Building");
      });
  });

  it("/real-estate/:id (PUT) - update property", () => {
    return request(app.getHttpServer())
      .put(`/real-estate/${propertyId}`)
      .send({ name: "Updated Building" })
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe("Updated Building");
      });
  });

  it("/real-estate/:id (DELETE) - delete property", () => {
    return request(app.getHttpServer())
      .delete(`/real-estate/${propertyId}`)
      .expect(200);
  });
});
