import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../../src/app.module";
import { setupTestDatabase, teardownTestDatabase } from "../setup";

describe("PracticeController (e2e)", () => {
  let app: INestApplication;
  let practiceAreaId: string;

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

  it("/practice (POST) - create practice area", () => {
    return request(app.getHttpServer())
      .post("/practice")
      .send({
        name: "Corporate Law",
        description: "Corporate legal services",
        specializations: ["Mergers", "Acquisitions", "Compliance"],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty("id");
        expect(res.body.name).toBe("Corporate Law");
        practiceAreaId = res.body.id;
      });
  });

  it("/practice (GET) - get all practice areas", () => {
    return request(app.getHttpServer())
      .get("/practice")
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("data");
        expect(res.body).toHaveProperty("total");
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });

  it("/practice/statistics (GET) - get statistics", () => {
    return request(app.getHttpServer())
      .get("/practice/statistics")
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("totalPracticeAreas");
        expect(res.body).toHaveProperty("topAreas");
      });
  });

  it("/practice/:id (GET) - get practice area by id", () => {
    return request(app.getHttpServer())
      .get(`/practice/${practiceAreaId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(practiceAreaId);
        expect(res.body.name).toBe("Corporate Law");
      });
  });

  it("/practice/:id (PUT) - update practice area", () => {
    return request(app.getHttpServer())
      .put(`/practice/${practiceAreaId}`)
      .send({ description: "Updated description" })
      .expect(200)
      .expect((res) => {
        expect(res.body.description).toBe("Updated description");
      });
  });

  it("/practice/:id (DELETE) - delete practice area", () => {
    return request(app.getHttpServer())
      .delete(`/practice/${practiceAreaId}`)
      .expect(200);
  });
});
