import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../src/index";
import User from "../../src/modules/user/user.model";
import jwt from "jsonwebtoken";
import e from "express";

import path from "path";
let accessToken = "";
let userId = "";
let mongoServer: MongoMemoryServer;
import { AvatarUploader } from "../../src/utils/media/AvatarUploader";
jest.mock("../../src/utils/media/AvatarUploader.ts");

AvatarUploader.prototype.generateAndUploadAvatar = jest.fn().mockResolvedValue({
  shareLink: "http://example.com/avatar.jpg",
});
AvatarUploader.prototype.uploadAvatar = jest.fn().mockResolvedValue({
  shareLink: "http://example.com/avatar.jpg",
});
const newUser = {
  email: "john2@example.com",
  password: "password123",
  confirmPassword: "password123",
  firstname: "John",
  lastname: "Doe",
};
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  app.close();
});

afterEach(async () => {
  // await User.deleteMany({});
});
describe("create and login", () => {
  it("should create a new user and return testtoken in the response", async () => {
    // test create user
    let response = await request(app).post("/user").send(newUser);
    expect(response.status).toBe(201);
  }),
    it("should return verified email", async () => {
      // test verify email
      const verifyToken = jwt.sign(
        { email: newUser.email },
        process.env.JWT_SECRET as string,
        { expiresIn: process.env.EXPIRES_IN_TOKEN },
      );
      const response2 = await request(app).get(`/user/verify/${verifyToken}`);

      expect(response2.status).toBe(200);
    }),
    it("should return ok and access token", async () => {
      // test login
      const loginData = {
        email: newUser.email,
        password: newUser.password,
      };
      const response3 = await request(app).post("/user/login").send(loginData);
      expect(response3.status).toBe(200);

      expect(response3.body.accessToken).toBeDefined();
      accessToken = response3.body.accessToken;
    }),
    it("should return ok change password", async () => {
      const changePasswordData = {
        oldPassword: newUser.password,
        newPassword: "password12345",
      };
      const response4 = await request(app)
        .put("/user/update-password")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(changePasswordData);
      // console.log(response4.body);
      // expect(response4.status).toBe(200);
    });
  it("should return bad request if password not changed", async () => {
    const changePasswordData = {
      oldPassword: newUser.password,
      newPassword: newUser.password,
    };
    const response4 = await request(app)
      .put("/user/update-password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(changePasswordData);
    expect(response4.status).toBe(400);
  });

  it("should upload an avatar successfully", async () => {
    const filePath = path.join(__dirname, "..", "assets", "image.png");

    const response = await request(app)
      .post(`/user/upload-avatar`)
      .set("Authorization", `Bearer ${accessToken}`) // Mock authentication
      .attach("avatar", filePath);
    expect(response.status).toBe(200);
  });
});
