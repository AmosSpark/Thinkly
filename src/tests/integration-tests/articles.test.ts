import request from "supertest";

import server from "../../server";

describe("mobile/api/v1/articles", () => {
  beforeEach(() => {
    server;
  });

  afterEach(async () => {
    server.close();
  });

  describe("GET /:id", () => {
    it("Should return 404 if article id is invalid", async () => {
      let response = await request(server).get("/api/v1/mobile/articles/1");

      expect(response.status).toBe(404);
    }, 30000);
  });
});
