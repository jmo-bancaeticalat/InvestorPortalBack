const server = require('../index.js');
const request = require('supertest'); 
const { PrismaClient } = require('@prisma/client');

// Mock PrismaClient to avoid access to the real database
jest.mock('@prisma/client', () => {

    const { mockPrismaClient } = require('../utils/moks.js');
    
    return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

const prismaMock = new PrismaClient();


describe("GET /api/v1/getTaxResidency", () => {

    beforeEach(() => {
        // Clear mock call history before each test
        jest.clearAllMocks();
    });

    test("Should respond with 200 status code and tax residency information", async () => {
        // Setup mock response for a found user
        prismaMock.investment_Account_Natural.findUnique.mockResolvedValue({
            id_investment_account_natural: 7,
            user_id: 1,
        });

        prismaMock.country_Tax_Residence.findMany.mockResolvedValue([
            { id: 1, country: 'USA', id_investment_account_natural: 7 },
            { id: 2, country: 'Canada', id_investment_account_natural: 7 },
        ]);

        const response = await request(server).get("/api/v1/getTaxResidency?accountId=7").send();

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("taxResidency");
        expect(response.body.taxResidency).toBeInstanceOf(Array);
        expect(response.body.taxResidency.length).toBe(2);
    });

    test("Should respond with 404 if user is not found", async () => {
        // Setup mock response for a not found user
        prismaMock.investment_Account_Natural.findUnique.mockResolvedValue(null);

        const response = await request(server).get("/api/v1/getTaxResidency?accountId=999").send();

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "User not found");
    });

});

describe("POST /api/v1/postTaxResidency", () => {

    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        jest.clearAllMocks();
    });

    test("Should respond with 201 status code and create a new tax residency record", async () => {
        // Setup mock responses
        prismaMock.country.findUnique.mockResolvedValue({
            id_country: 39,
            name: 'Chile'
        });

        prismaMock.investment_Account_Natural.findUnique.mockResolvedValue({
            id_investment_account_natural: 7,
            user_id: 1,
        });

        prismaMock.country_Tax_Residence.findFirst.mockResolvedValue(null);

        prismaMock.country_Tax_Residence.create.mockResolvedValue({
            id: 1,
            id_investment_account_natural: 7,
            id_country: 1,
        });

        const response = await request(server)
            .post("/api/v1/postTaxResidency")
            .send({ accountId: 7, countryId: 39 });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("newTaxResidency");
    });

    test("Should respond with 404 if country does not exist", async () => {
        prismaMock.country.findUnique.mockResolvedValue(null);

        const response = await request(server)
            .post("/api/v1/postTaxResidency")
            .send({ accountId: 7, countryId: 1 });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "Country does not exist");
    });

    test("Should respond with 409 if a tax residency record already exists", async () => {
        prismaMock.country.findUnique.mockResolvedValue({
            id_country: 1,
            name: 'USA'
        });

        prismaMock.investment_Account_Natural.findUnique.mockResolvedValue({
            id_investment_account_natural: 7,
            user_id: 1,
        });

        prismaMock.country_Tax_Residence.findFirst.mockResolvedValue({
            id: 1,
            id_investment_account_natural: 7,
            id_country: 1,
        });

        const response = await request(server)
            .post("/api/v1/postTaxResidency")
            .send({ accountId: 7, countryId: 1 });

        expect(response.statusCode).toBe(409);
        expect(response.body).toHaveProperty("error", "A tax residency record already exists for this user. Use the update function to modify it.");
    });
});

describe("POST /api/v1/postPEP", () => {

    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        jest.clearAllMocks();
    });

    test("Should respond with 201 status code and return the new PEP register", async () => {
        // Setup mock responses
        prismaMock.investment_Account_Natural.findFirst
            .mockResolvedValueOnce({ id_investment_account_natural: 1, id_pep: 0 }) // for existingAccount
            .mockResolvedValueOnce({ id_investment_account_natural: 1, id_pep: 0 }); // for existingPEP
        prismaMock.country.findUnique.mockResolvedValueOnce({ id_country: 1 });
        prismaMock.pEP.create.mockResolvedValueOnce({
            id_pep: 1,
            position_held: "President",
            pep_relationship: "Self",
            name_pep: "John Doe",
            id_country: 1
        });

        const response = await request(server)
            .post("/api/v1/postPEP")
            .send({
                id_investment_account_natural: 1,
                position_held: "President",
                pep_relationship: "Self",
                name_pep: "John Doe",
                id_country: 1
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("id_pep", 1);
        expect(response.body).toHaveProperty("position_held", "President");
        expect(response.body).toHaveProperty("pep_relationship", "Self");
        expect(response.body).toHaveProperty("name_pep", "John Doe");
    });

    test("Should respond with 404 if investment account does not exist", async () => {
        prismaMock.investment_Account_Natural.findFirst.mockResolvedValue(null);

        const response = await request(server)
            .post("/api/v1/postPEP")
            .send({
                id_investment_account_natural: 7,
                position_held: "Senator",
                pep_relationship: "Self",
                name_pep: "John Doe",
                id_country: 1
            });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "The investment account does not exist");
    });

    test("Should respond with 400 if country ID is missing", async () => {
        const response = await request(server)
            .post("/api/v1/postPEP")
            .send({
                id_investment_account_natural: 7,
                position_held: "Senator",
                pep_relationship: "Self",
                name_pep: "John Doe"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error", "Missing country ID");
    });

    test("Should respond with 400 if position held is missing", async () => {
        const response = await request(server)
            .post("/api/v1/postPEP")
            .send({
                id_investment_account_natural: 7,
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

    test("Should respond with 400 if PEP relationship is missing", async () => {
        const response = await request(server)
            .post("/api/v1/postPEP")
            .send({
                id_investment_account_natural: 7,
                position_held: "Senator",
                name_pep: "John Doe",
                id_country: 1
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error", "Missing PEP relationship");
    });

    test("Should respond with 409 if a PEP record already exists for this account", async () => {
        prismaMock.country.findUnique.mockResolvedValue({
            id_country: 1,
            name: 'USA'
        });

        prismaMock.investment_Account_Natural.findFirst
            .mockResolvedValueOnce({
                id_investment_account_natural: 7,
                user_id: 1,
            })
            .mockResolvedValueOnce({
                id_investment_account_natural: 7,
                pep: { id_pep: 1 }
            });

        const response = await request(server)
            .post("/api/v1/postPEP")
            .send({
                id_investment_account_natural: 7,
                position_held: "Senator",
                pep_relationship: "Self",
                name_pep: "John Doe",
                id_country: 1
            });

        expect(response.statusCode).toBe(409);
        expect(response.body).toHaveProperty("error", "This investment account already has a defined PEP.");
    });
});

describe("PUT /api/v1/putIfPEP", () => {

    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        jest.clearAllMocks();
    });

    test("Should respond with 200 status code and update PEP status", async () => {
        // Setup mock responses
        prismaMock.investment_Account_Natural.findFirst.mockResolvedValueOnce({
            id_investment_account_natural: 7,
            if_pep: false,
        });

        prismaMock.investment_Account_Natural.update.mockResolvedValue({
            id_investment_account_natural: 7,
            if_pep: true,
        });

        const response = await request(server)
            .put("/api/v1/putIfPEP")
            .send({
                id_investment_account_natural: 7,
                if_pep: true,
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("if_pep", true);
    });


    test("Should respond with 404 if investment account does not exist", async () => {
        prismaMock.investment_Account_Natural.findFirst.mockResolvedValue(null);

        const response = await request(server)
            .put("/api/v1/putIfPEP")
            .send({
                id_investment_account_natural: 7,
                if_pep: true,
            });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "The investment account does not exist");
    });
});

describe("PUT /api/v1/putIfAML", () => {

    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        jest.clearAllMocks();
    });

    test("Should respond with 200 status code and update AML status", async () => {
        // Setup mock responses
        prismaMock.investment_Account_Natural.findFirst.mockResolvedValueOnce({
            id_investment_account_natural: 7,
            if_AML: false,
        });

        prismaMock.investment_Account_Natural.update.mockResolvedValue({
            id_investment_account_natural: 7,
            if_AML: true,
        });

        const response = await request(server)
            .put("/api/v1/putIfAML")
            .send({
                id_investment_account_natural: 7,
                if_AML: true,
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("if_AML", true);
    });

    test("Should respond with 404 if investment account does not exist", async () => {
        prismaMock.investment_Account_Natural.findFirst.mockResolvedValue(null);

        const response = await request(server)
            .put("/api/v1/putIfAML")
            .send({
                id_investment_account_natural: 7,
                if_AML: true,
            });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "The investment account does not exist");
    });
});

describe("PUT /api/v1/putQualifiedInvestor", () => {

    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        jest.clearAllMocks();
    });

    test("Should respond with 200 status code and update qualified investor status", async () => {
        // Setup mock responses
        prismaMock.investment_Account_Natural.findFirst.mockResolvedValueOnce({
            id_investment_account_natural: 7,
            if_qualified_investor: false,
        });

        prismaMock.investment_Account_Natural.update.mockResolvedValue({
            id_investment_account_natural: 7,
            if_qualified_investor: true,
        });

        const response = await request(server)
            .put("/api/v1/putQualifiedInvestor")
            .send({
                id_investment_account_natural: 7,
                if_qualified_investor: true,
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("if_qualified_investor", true);
    });

    test("Should respond with 404 if investment account does not exist", async () => {
        prismaMock.investment_Account_Natural.findFirst.mockResolvedValue(null);

        const response = await request(server)
            .put("/api/v1/putQualifiedInvestor")
            .send({
                id_investment_account_natural: 7,
                if_qualified_investor: true,
            });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "The investment account does not exist");
    });
});

describe("GET /api/v1/getInvestmentAccountLegal", () => {

    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        jest.clearAllMocks();
    });

    test("Should respond with 200 status code and return the investment account", async () => {
        // Setup mock responses
        prismaMock.investment_Account_Legal.findUnique.mockResolvedValueOnce({
            id_investment_account_legal: 7,
            account_name: "Test Legal Account",
        });

        const response = await request(server)
            .get("/api/v1/getInvestmentAccountLegal")
            .query({
                id_investment_account_legal: 7,
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("id_investment_account_legal", 7);
        expect(response.body).toHaveProperty("account_name", "Test Legal Account");
    });

    test("Should respond with 404 if investment account does not exist", async () => {
        prismaMock.investment_Account_Legal.findUnique.mockResolvedValue(null);

        const response = await request(server)
            .get("/api/v1/getInvestmentAccountLegal")
            .query({
                id_investment_account_legal: 7,
            });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "The investment account does not exist");
    });

});

describe("POST /api/v1/postInvestmentAccountLegal", () => {


    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        jest.clearAllMocks();
    });

    test("Should respond with 201 status code and create the investment account", async () => {
        // Setup mock responses
        prismaMock.legal_Person.findFirst.mockResolvedValueOnce({
            id_legal_person: 1,
        });

        prismaMock.investment_Account_Legal.create.mockResolvedValueOnce({
            id_investment_account_legal: 1,
            id_legal_person: 1,
        });

        const response = await request(server)
            .post("/api/v1/postInvestmentAccountLegal")
            .send({
                id_legal_person: 1,
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("ok", true);
        expect(response.body.createdInvestmentAccountLegal).toHaveProperty("id_investment_account_legal", 1);
        expect(response.body.createdInvestmentAccountLegal).toHaveProperty("id_legal_person", 1);
    });

    test("Should respond with 404 if legal person does not exist", async () => {
        prismaMock.legal_Person.findFirst.mockResolvedValueOnce(null);

        const response = await request(server)
            .post("/api/v1/postInvestmentAccountLegal")
            .send({
                id_legal_person: 1,
            });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "The legal person does not exist");
    });
});


describe("POST /api/v1/postInvestmentAccountNatural", () => {

    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        jest.clearAllMocks();
    });

    test("Should respond with 201 status code and create the investment account", async () => {
        // Setup mock responses
        prismaMock.natural_Person.findFirst.mockResolvedValueOnce({
            id_natural_person: 1,
        });

        prismaMock.investment_Account_Natural.create.mockResolvedValueOnce({
            id_investment_account_natural: 1,
            id_natural_person: 1,
            identifier_national_number: "12345678-9",
            id_country_account: 0,
            id_educational_level: 0,
            id_occupation: 0,
            id_income_range: 0,
            id_pep: 0,
        });

        const response = await request(server)
            .post("/api/v1/postInvestmentAccountNatural")
            .send({
                id_natural_person: 1,
                identifier_national_number: "12345678-9",
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("ok", true);
        expect(response.body.createdInvestmentAccountNatural).toHaveProperty("id_investment_account_natural", 1);
        expect(response.body.createdInvestmentAccountNatural).toHaveProperty("id_natural_person", 1);
        expect(response.body.createdInvestmentAccountNatural).toHaveProperty("identifier_national_number", "12345678-9");
    });


    test("Should respond with 404 if natural person does not exist", async () => {
        prismaMock.natural_Person.findFirst.mockResolvedValueOnce(null);

        const response = await request(server)
            .post("/api/v1/postInvestmentAccountNatural")
            .send({
                id_natural_person: 1,
                identifier_national_number: "12345678-9",
            });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "The natural person does not exist");
    });
});

describe("GET /api/v1/getInvestmentAccountNaturalPostgres", () => {


    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        jest.clearAllMocks();
    });

    test("Should respond with 200 status code and return the investment account", async () => {
        // Setup mock responses
        prismaMock.investment_Account_Natural.findUnique.mockResolvedValueOnce({
            id_investment_account_natural: 1,
            id_natural_person: 1,
            identifier_national_number: "12345678-9",
            id_country_account: 0,
            id_educational_level: 0,
            id_occupation: 0,
            id_income_range: 0,
            id_pep: 0,
        });

        const response = await request(server)
            .get("/api/v1/getInvestmentAccountNaturalPostgres")
            .query({
                id_investment_account_natural: 1,
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("id_investment_account_natural", 1);
        expect(response.body).toHaveProperty("id_natural_person", 1);
        expect(response.body).toHaveProperty("identifier_national_number", "12345678-9");
    });

    test("Should respond with 404 if account does not exist", async () => {
        prismaMock.investment_Account_Natural.findUnique.mockResolvedValueOnce(null);

        const response = await request(server)
            .get("/api/v1/getInvestmentAccountNaturalPostgres")
            .query({
                id_investment_account_natural: 1,
            });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "The investment account does not exist");
    });
});


afterAll(() => {
    server.close();
});
  