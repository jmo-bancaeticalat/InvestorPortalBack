const server = require('../index.js');
const request = require('supertest'); //SuperTest is used to test the Express application without starting the server 

const {
    clearTaxResidency,
    statusAccount
  } = require('../controllers/account.controller.js');


describe("GET /api/v1/getTaxResidency", () => {

    test("Should respond with 200 status code and tax residency information", async () => {
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

    test("Should respond with 201 status code and new tax residency information", async () => {

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


    test("Should respond with 201 status code and new PEP register", async () => {

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

describe("PUT /api/v1/putIfPEP", () => {

    let currentPEPStatus;

    beforeEach(async () => {
        const account = await statusAccount();
        currentPEPStatus = account.if_pep;
    });

    test("Should respond with 200 status code and updated account", async () => {
        const newPEPStatus = !currentPEPStatus;

        const response = await request(server)
            .put("/api/v1/putIfPEP")
            .send({
                id_investment_account_natural: 8,
                if_pep: newPEPStatus
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("id_investment_account_natural");
        expect(response.body).toHaveProperty("if_pep", newPEPStatus);
    });

    test("Should respond with 404 if investment account does not exist", async () => {
        const response = await request(server)
            .put("/api/v1/putIfPEP")
            .send({
                id_investment_account_natural: 999,
                if_pep: true
            });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "The investment account does not exist");
    });

});

describe("PUT /api/v1/putIfAML", () => {

    let currentAmlStatus;

    beforeEach(async () => {
        const account = await statusAccount();
        currentAmlStatus = account.if_AML;
    });

    test("Should respond with 200 status code and updated account", async () => {

        let newAmlStatus = !currentAmlStatus;

        const response = await request(server)
            .put("/api/v1/putIfAML")
            .send({
                id_investment_account_natural: 8,
                if_AML: newAmlStatus
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("id_investment_account_natural");
    });

    test("Should respond with 404 if investment account does not exist", async () => {
        const response = await request(server)
            .put("/api/v1/putIfAML")
            .send({
                id_investment_account_natural: 999,
                if_AML: true
            });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "The investment account does not exist");
    });

});

describe("PUT /api/v1/putQualifiedInvestor", () => {

    let currentQualifiedInvestorStatus;

    beforeEach(async () => {
        const account = await statusAccount();
        currentQualifiedInvestorStatus = account.if_qualified_investor;
    });

    test("Should respond with 200 status code and updated account", async () => {

        let newQualifiedInvestorStatus = !currentQualifiedInvestorStatus;

        const response = await request(server)
            .put("/api/v1/putQualifiedInvestor")
            .send({
                id_investment_account_natural: 8,
                if_qualified_investor: newQualifiedInvestorStatus
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("id_investment_account_natural");
    });

    test("Should respond with 404 if investment account does not exist", async () => {
        const response = await request(server)
            .put("/api/v1/putQualifiedInvestor")
            .send({
                id_investment_account_natural: 999,
                if_qualified_investor: true
            });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "The investment account does not exist");
    });
});

describe("GET /api/v1/getInvestmentAccountLegal", () => {

    test("Should respond with 200 status code and account information", async () => {
        const response = await request(server)
            .get("/api/v1/getInvestmentAccountLegal?id_investment_account_legal=1")
            .send();

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("id_investment_account_legal");
    });

    test("Should respond with 404 if investment account does not exist", async () => {
        const response = await request(server)
            .get("/api/v1/getInvestmentAccountLegal?id_investment_account_legal=999")
            .send();

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "The investment account does not exist");
    });

});

describe("POST /api/v1/postInvestmentAccountLegal", () => {

    test("Should respond with 201 status code and the created investment account", async () => {
        const response = await request(server)
            .post("/api/v1/postInvestmentAccountLegal")
            .send({ id_legal_person: 1 });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("ok", true);
        expect(response.body).toHaveProperty("createdInvestmentAccountLegal");
    });

    test("Should respond with 404 if legal person does not exist", async () => {
        const response = await request(server)
            .post("/api/v1/postInvestmentAccountLegal")
            .send({ id_legal_person: 999 });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "The legal person does not exist");
    });
});


describe("POST /api/v1/postInvestmentAccountNatural", () => {

    test("Should respond with 201 status code and the created investment account", async () => {
        const response = await request(server)
            .post("/api/v1/postInvestmentAccountNatural")
            .send({ 
                id_natural_person: 1,
                identifier_national_number: "12345678-9" 
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("ok", true);
        expect(response.body).toHaveProperty("createdInvestmentAccountNatural");
    });

    test("Should respond with 404 if natural person does not exist", async () => {
        const response = await request(server)
            .post("/api/v1/postInvestmentAccountNatural")
            .send({ id_natural_person: 999, identifier_national_number: "12345678-9" });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "The natural person does not exist");
    });
});

describe("GET /api/v1/getInvestmentAccountNaturalPostgres", () => {

    test("Should respond with 200 status code and the investment account details", async () => {
        const response = await request(server)
            .get("/api/v1/getInvestmentAccountNaturalPostgres")
            .query({ id_investment_account_natural: 8 });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("id_investment_account_natural", 8);
    });

    test("Should respond with 404 if investment account does not exist", async () => {
        const response = await request(server)
            .get("/api/v1/getInvestmentAccountNaturalPostgres")
            .query({ id_investment_account_natural: 999 });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "The investment account does not exist");
    });
});


afterAll(() => {
    server.close();
});
  