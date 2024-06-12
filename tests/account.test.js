const server = require('../index.js');
const request = require('supertest'); //SuperTest is used to test the Express application without starting the server 


const {
    clearTaxResidency,
  } = require('../controllers/account.controller.js');



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

describe("POST /api/v1/postPEP", () => {


    test("Should respond with a 201 status code and new PEP register", async () => {

        const body = {
            id_investment_account_natural: 7,
            position_held: "President",
            pep_relationship: "Self",
            name_pep: "John Doe",
            id_country: 39
        }

        const response = await request(server)
            .post("/api/v1/postPEP")
            .send(body);

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("id_pep");
        expect(response.body).toHaveProperty("position_held", "President");
        expect(response.body).toHaveProperty("pep_relationship", "Self");
        expect(response.body).toHaveProperty("name_pep", "John Doe");
        expect(response.body).toHaveProperty("id_country", 39);
    });


    test("Should respond with 404 if investment account does not exist", async () => {
        
        const body = {
            id_investment_account_natural: 999,
            position_held: "President",
            pep_relationship: "Self",
            name_pep: "John Doe",
            id_country: 39
        }

        const response = await request(server)
            .post("/api/v1/postPEP")
            .send(body);

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "The investment account does not exist");
    });

    test("Should respond with 400 if account ID is missing", async () => {
        const response = await request(server)
            .post("/api/v1/postPEP")
            .send({
                position_held: "President",
                pep_relationship: "Self",
                name_pep: "John Doe",
                id_country: 1
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error", "Missing account ID");
    });

    test("Should respond with 400 if position held is missing", async () => {
        const response = await request(server)

            .post("/api/v1/postPEP")
            .send({
                id_investment_account_natural: 1,
                pep_relationship: "Self",
                name_pep: "John Doe",
                id_country: 1
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error", "Missing Position held");
    });

    test("Should respond with 400 if PEP relationship is missing", async () => {
        const response = await request(server)
            .post("/api/v1/postPEP")
            .send({
                id_investment_account_natural: 1,
                position_held: "President",
                name_pep: "John Doe",
                id_country: 1
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error", "Missing PEP relationship");
    });

    test("Should respond with 400 if PEP name is missing", async () => {
        const response = await request(server)
            .post("/api/v1/postPEP")
            .send({
                id_investment_account_natural: 1,
                position_held: "President",
                pep_relationship: "Self",
                id_country: 1
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error", "Missing PEP name");
    });

    test("Should respond with 409 if investment account already has a defined PEP", async () => {
        const response = await request(server)
            .post("/api/v1/postPEP")
            .send({
                id_investment_account_natural: 8,
                position_held: "President",
                pep_relationship: "Self",
                name_pep: "John Doe",
                id_country: 1,
                id_pep: 1
            });

        expect(response.statusCode).toBe(409);
        expect(response.body).toHaveProperty("error", "This investment account already has a defined PEP.");
    });

});

afterAll(() => {
    server.close();
});
  