const server = require('../index.js');
const request = require('supertest'); 
const { PrismaClient } = require('@prisma/client');

// Mockear PrismaClient para evitar el acceso a la base de datos real
jest.mock('@prisma/client', () => {

    const { mockPrismaClient } = require('../utils/mocks.js');
    
    return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

const prismaMock = new PrismaClient();

//Test endpoint getProfilesPostgres - return profile of a specific account
describe("GET /api/v1/getProfilesPostgres", () => {

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    jest.clearAllMocks();
  });

  test("Should respond with 200 and return profiles", async () => {

    const profiles = [
        { id: 1, name: "Profile 1" },
        { id: 2, name: "Profile 2" },
    ];
    prismaMock.profile.findMany.mockResolvedValue(profiles); // Mock findMany to return some profiles

    const response = await request(server).get("/api/v1/getProfilesPostgres");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("ok", true);
    expect(response.body).toHaveProperty("getProfiles", profiles);
  });

  test("Should respond with 400 if query params are present", async () => {

    const response = await request(server).get("/api/v1/getProfilesPostgres").query({ param: "value" });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "No parameters allowed in the request");
  });
});

afterAll(() => {
  server.close();
 });