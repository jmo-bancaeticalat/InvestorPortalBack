const server = require('../index.js');
const request = require('supertest'); //SuperTest is used to test the Express application without starting the server 

describe("GET /api/v1/getTaxResidency", () => {

    test("Should respond with a 200 status code and tax residency information", async () => {
        const response = await request(server).get("/api/v1/getTaxResidency?accountId=8").send();
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("taxResidency");
        expect(response.body.taxResidency).toBeInstanceOf(Array);
    });

    test("Should respond with 404 if user is not found", async () => {
        const response = await request(server).get("/api/v1/getTaxResidency?accountId=999").send();
        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "User not found");
    });

});

afterAll(() => {
    server.close();
});
  