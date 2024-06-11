const server = require('../index.js');
const request = require('supertest'); //SuperTest is used to test the Express application without starting the server 


const {
    clearTaxResidency
  } = require('../controllers/account.controller.js')


describe("GET /api/v1/getTaxResidency", () => {

    test("Should respond with a 200 status code and tax residency information", async () => {
        const response = await request(server).get("/api/v1/getTaxResidency?accountId=7").send();
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

describe("POST /api/v1/postTaxResidency", () => {

    beforeEach(async () => {
        await clearTaxResidency();
    });

    test("Should respond with a 201 status code and new tax residency information", async () => {

        const body = {
            "countryId": 38,
            "accountId": 8
        }

        const response = await request(server)
            .post("/api/v1/postTaxResidency")
            .send(body);

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("newTaxResidency");
    });

    test("Should respond with 404 if investment account does not exist", async () => {

        const body = {
            "countryId": 38,
            "accountId": 999
        }

        const response = await request(server)
            .post("/api/v1/postTaxResidency")
            .send(body);

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "The investment account does not exist.");
    });

    test("Should respond with 409 if tax residency record already exists", async () => {

        const body = {
            "countryId": 38,
            "accountId": 7
        }
        const response = await request(server)
            .post("/api/v1/postTaxResidency")
            .send(body);

        expect(response.statusCode).toBe(409);
        expect(response.body).toHaveProperty("error", "A tax residency record already exists for this user. Use the update function to modify it.");
    });
});

afterAll(() => {
    server.close();
});
  