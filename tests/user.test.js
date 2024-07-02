const server = require('../index.js');
const request = require('supertest'); 
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

// Mockear PrismaClient para evitar el acceso a la base de datos real
jest.mock('@prisma/client', () => {

    const { mockPrismaClient } = require('../utils/mocks.js');
    
    return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

const prismaMock = new PrismaClient();

describe("PUT /api/v1/putUpdatePassword", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Should respond with 200 and update the password successfully", async () => {
    const email = 'test@example.com';
    const newPassword = 'NewPassword123!';
    const existingUser = {
      id: 1,
      email: email,
      password: 'OldHashedPassword',
    };

    prismaMock.user.findFirst.mockResolvedValueOnce(existingUser);

    prismaMock.user.update.mockResolvedValueOnce({
      id: existingUser.id,
      email: existingUser.email,
      password: newPassword,
    });

    const response = await request(server)
      .put("/api/v1/putUpdatePassword")
      .send({ email, newPassword });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("ok", true);
    expect(response.body).toHaveProperty("message", "Password updated successfully");
  });

  test("Should respond with 404 if user is not found", async () => {
    prismaMock.user.findFirst.mockResolvedValueOnce(null);

    const response = await request(server)
      .put("/api/v1/putUpdatePassword")
      .send({ email: "nonexistent@example.com", newPassword: "NewPassword123!" });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("error", "User not found");
  });

  test("Should respond with 400 if new password is the same as the old one", async () => {
    const email = 'test@example.com';
    const newPassword = 'NewPassword123!';
    const existingUser = {
      id_user: 1,
      email: email,
      password: '$2a$10$BG2zc6xdnLET6VE2PzKTUOAlbQwsNausqb1aY/Q0CBzz4882dJNsC', // hashed version of 'NewPassword123!'
    };
  
    prismaMock.user.findFirst.mockResolvedValueOnce(existingUser);
  

    // Mock bcrypt compare to return true, indicating the passwords are the same
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    const response = await request(server)
      .put("/api/v1/putUpdatePassword")
      .send({ email, newPassword });
  
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "The new password cannot be the same as the old one");
  });
  
});

describe("POST /api/v1/postLoginUserPostgres", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Should respond with 200 and return token on successful login", async () => {
    const email = "test@example.com";
    const password = "'$2a$10$BG2zc6xdnLET6VE2PzKTUOAlbQwsNausqb1aY/Q0CBzz4882dJNsC'";

    prismaMock.user.findUnique.mockResolvedValueOnce({ email: email, password: password });


    const response = await request(server)
        .post("/api/v1/postLoginUserPostgres")
        .send({ email: email, password: password });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("ok", true);
    expect(response.body).toHaveProperty("token");
  });

  test("Should respond with 400 if user is not found", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    const response = await request(server)
        .post("/api/v1/postLoginUserPostgres")
        .send({ email: "nonexistent@example.com", password: "password" });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "User not found");
  });

  test("Should respond with 400 if password is incorrect", async () => {
    const email = "test@example.com";
    const password = "password";
    const incorrectPassword = "incorrect_password";
    const hashedPassword = await bcrypt.hash(password, 10);

    prismaMock.user.findUnique.mockResolvedValueOnce({ email: email, password: hashedPassword });
    bcrypt.compare = jest.fn().mockResolvedValueOnce(false); // Simula que las contraseñas no coinciden

    const response = await request(server)
        .post("/api/v1/postLoginUserPostgres")
        .send({ email: email, password: incorrectPassword });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "Incorrect password");
  });
});


describe("POST /api/v1/postUserPostgres", () => {

  beforeEach(() => {
      jest.clearAllMocks();
  });

  test("Should create a new user and respond with 201", async () => {
      const newUser = {
          email: 'newuser@example.com',
          password: 'Password123!',
          terms_and_conditions: true,
      };

      // Mock bcrypt hash function
      bcrypt.hash = jest.fn().mockResolvedValue('hashedpassword');

      // Mock Prisma responses
      prismaMock.user.findMany.mockResolvedValueOnce([]);
      prismaMock.user.create.mockResolvedValueOnce({ id: 1, ...newUser, registration_date: new Date() });

      const response = await request(server)
          .post("/api/v1/postUserPostgres")
          .send(newUser);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("ok", true);
      expect(response.body.createdUser.email).toBe(newUser.email);

      // Check if bcrypt.hash was called once
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
  });

  test("Should respond with 400 if user with the same email already exists", async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([{ id: 1, email: 'existinguser@example.com' }]);

    const response = await request(server)
        .post("/api/v1/postUserPostgres")
        .send({ email: 'existinguser@example.com', password: 'Password123!', terms_and_conditions: true });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "There is already a user created with this email");
  });

});


describe("GET /api/v1/getUserPostgres", () => {

  beforeEach(() => {
      jest.clearAllMocks();
  });

  test("Should respond with 200 and return user information with profile", async () => {
      const mockUser = {
          id_user: 1,
          username: 'testuser',
          profile: {
              name: 'Test Profile'
          }
      };
      prismaMock.user.findMany.mockResolvedValueOnce([mockUser]);

      const response = await request(server)
          .get("/api/v1/getUserPostgres")
          .query({ id_user: 1 });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([mockUser]);
  });

  test("Should respond with 404 if user is not found", async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([]);

    const response = await request(server)
        .get("/api/v1/getUserPostgres")
        .query({ id_user: 999 });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("error", "User not found");
  });
});

afterAll(() => {
  server.close();
 });
