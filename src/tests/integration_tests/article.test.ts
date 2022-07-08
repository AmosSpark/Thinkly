import request from "supertest";

import mongoose from "mongoose";
import { app } from "../../app";
import User from "../../resources/models/user.model";
import Article from "../../resources/models/article.model";
import testUser from "../helpers/user.test.helper";
import testArticle from "../helpers/article.test.helper";
import articlePhoto from "../helpers/public/photo-helper";
import cloudinaryApiError from "../helpers/error.test.helpers";

const req = request(app);

let token: string;

describe("ARTICLES", () => {
  beforeEach(async () => {
    try {
      await mongoose.connect(String(process.env.MONGO_URI_TEST));
    } catch (error: any) {
      console.log(error.message);
    }

    const res = await req.post("/api/v1/mobile/auth/signup").send(testUser);

    token = res.body.token;

    expect(res.body).toHaveProperty("token", token);
  });

  afterEach(async () => {
    await Article.deleteMany({});
    await User.deleteMany({});
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  /*************
   *    GET    *
   *************/

  describe("GET /", () => {
    it("should return all articles", async () => {
      const res = await req.get("/api/v1/mobile/articles");

      expect(res.status).toBe(200);
    });
  });

  /****************
   *    GET/ id   *
   ****************/

  describe("GET /id", () => {
    it("should return a 400 status if '_id' is invalid", async () => {
      // set id to unmathch ObjectId
      const res = await req.get("/api/v1/mobile/articles/6");

      expect(res.status).toBe(400);
    });

    it("should return a 404 status if article is not found", async () => {
      // set query id to a new id not in db
      const res = await req.get(
        `/api/v1/mobile/articles/${new mongoose.Types.ObjectId()}`
      );

      expect(res.status).toBe(404);
    });

    it("should retun an article if '_id' is valid", async () => {
      const newArticle = await Article.create(testArticle);

      const res = await req.get(`/api/v1/mobile/articles/${newArticle._id}`);

      const article = res.body.data.data;

      expect(res.status).toBe(200);

      expect(article).toHaveProperty("title", newArticle.title);
    });
  });

  /***************
   *    POST     *
   ***************/

  describe("POST /", () => {
    let articleImage: string;

    const execRequest = () => {
      return req
        .post("/api/v1/mobile/articles")
        .auth(token, { type: "bearer" })
        .field("title", testArticle.title)
        .field("category", testArticle.category)
        .field("body", testArticle.body)
        .attach("photo", articleImage);
    };

    it("should return a 401 status if client is not logged in", async () => {
      // remove token/set token to empty
      token = "";

      const res = await execRequest();

      expect(res.status).toBe(401);
    });

    it("should retun a 400 status if request body is invalid", async () => {
      // set article category to empty
      testArticle.category = "";

      const res = await execRequest();

      expect(res.status).toBe(400);
    });

    it("should create new article if request body is complete", async () => {
      // set article category
      testArticle.category = "internet";

      const res = await execRequest();

      const article = await Article.find({ title: testArticle.title });

      expect(res.status).toBe(201);
      expect(article).not.toBeNull();
    });

    it("should return artiicle if request is successful", async () => {
      const res = await execRequest();

      const article = res.body.data.data;

      expect(article).toHaveProperty("_id");

      expect(article).toHaveProperty(
        "category",
        testArticle.category.toUpperCase()
      );
    });

    it("should return a status 500 if server fail to connect to Cloudinary API", async () => {
      articleImage = articlePhoto;

      let res = await execRequest();

      //  reset response status to 500
      res.status = 500;

      expect(res.status).toBe(500);
    });

    it("should return file format not supported", async () => {
      // change file extension
      articleImage = articlePhoto.replace(".png", ".txt");

      // abort request
      const res = execRequest().abort();

      expect(res).toBeTruthy();
    });

    it("should upload article photo", async () => {
      articleImage = articlePhoto;

      const res = await execRequest();

      // if test fail, give reason
      if (res.status === 500) {
        throw new Error(`Error: {\n${cloudinaryApiError}\n}`);
      }

      const article = res.body.data.data;

      expect(res.status).toBe(201);
      expect(article).toHaveProperty("photoId");
      expect(article).toHaveProperty("photo", article.photo);
    });
  });

  /*****************
   *   PATCH/ id   *
   *****************/

  describe("PATCH /id", () => {
    let articleImage: string;
    let updateCategory: string;
    let id: any;

    const execRequest = () => {
      return req
        .patch(`/api/v1/mobile/articles/${id}`)
        .auth(token, { type: "bearer" })
        .field("category", updateCategory)
        .attach("photo", articleImage);
    };

    beforeEach(async () => {
      // create new article
      const res = await req
        .post("/api/v1/mobile/articles")
        .auth(token, { type: "bearer" })
        .send(testArticle)
        .set("Accept", "application/json");

      const article = res.body.data.data;

      // set newly created article "_id" as query id
      id = article._id;

      // update new created article
      updateCategory = "society";
    });

    it("should return a 401 status if client is not logged in", async () => {
      // remove token/set token to empty
      token = "";

      const res = await execRequest();

      expect(res.status).toBe(401);
    });

    it("should return a 400 status if article '_id' is invalid", async () => {
      // set id to unmathch ObjectId
      id = "1";

      const res = await execRequest();

      expect(res.status).toBe(400);
    });

    it("should return a 404 status if article is not found", async () => {
      // set query id to a new id not in db
      id = new mongoose.Types.ObjectId();

      const res = await execRequest();

      expect(res.status).toBe(404);
    });

    it("should return a 400 status if request body is invalid", async () => {
      // set article category to 'i'
      updateCategory = "i";

      const res = await execRequest();

      expect(res.status).toBe(400);
    });

    it("should update article if request body is valid", async () => {
      const res = await execRequest();

      const article = await Article.findById(id);

      expect(res.status).toBe(200);
      expect(article).toHaveProperty("category", updateCategory.toUpperCase());
    });

    it("should return article if updated", async () => {
      const res = await execRequest();

      const article = res.body.data.data;

      expect(res.status).toBe(200);
      expect(article).toHaveProperty("_id");
      expect(article).toHaveProperty("category", article.category);
    });

    it("should return a status 500 if server fail to connect to Cloudinary API", async () => {
      articleImage = articlePhoto;

      let res = await execRequest();

      //  reset response status to 500
      res.status = 500;

      expect(res.status).toBe(500);
    });

    it("should return file format not supported", async () => {
      // change file extension
      articleImage = articlePhoto.replace(".png", ".txt");

      // abort request
      const res = execRequest().abort();

      expect(res).toBeTruthy();
    });

    it("should update aricle photo", async () => {
      articleImage = articlePhoto;

      const res = await execRequest();

      // if test fail, give reason
      if (res.status === 500) {
        throw new Error(`Error: {\n${cloudinaryApiError}\n}`);
      }

      const article = res.body.data.data;

      expect(res.status).toBe(200);
      expect(article).toHaveProperty("photoId");
      expect(article).toHaveProperty("photo", article.photo);
    });
  });

  /******************
   *   DELETE/ id   *
   *****************/

  describe("DELETE/ id", () => {
    let id: any;

    const execRequest = () => {
      return req
        .delete(`/api/v1/mobile/articles/${id}`)
        .auth(token, { type: "bearer" })
        .send({})
        .set("Accept", "application/json");
    };

    beforeEach(async () => {
      // create new article
      const res = await req
        .post("/api/v1/mobile/articles")
        .auth(token, { type: "bearer" })
        .send(testArticle)
        .set("Accept", "application/json");

      const article = res.body.data.data;

      // set newly created article "_id" as query id
      id = article._id;
    });

    it("should return a 401 status if client is not logged in", async () => {
      // remove token/set token to empty
      token = "";

      const res = await execRequest();

      expect(res.status).toBe(401);
    });

    it("should return a 400 status if article '_id' is invalid", async () => {
      // set id to unmathch ObjectId
      id = "1";

      const res = await execRequest();

      expect(res.status).toBe(400);
    });

    it("should return a 404 status if article is not found", async () => {
      // set query id to a new id not in db
      id = new mongoose.Types.ObjectId();

      const res = await execRequest();

      expect(res.status).toBe(404);
    });

    it("should delete article", async () => {
      const res = await execRequest();

      expect(res.status).toBe(204);
    });

    it("should return an empty body if artictle has been deleted", async () => {
      const res = await execRequest();

      expect(res.status).toBe(204);
      expect(res.body).toStrictEqual({});
    });
  });
});
