const server = require('../index.js');
const request = require('supertest'); 
const { PrismaClient } = require('@prisma/client');


// Mock PrismaClient to avoid access to the real database
jest.mock('@prisma/client', () => {

    const { mockPrismaClient } = require('../utils/mocks.js');
    
    return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

const prismaMock = new PrismaClient();


describe("GET /api/v1/getIncomeRanges", () => {

    test("Should respond with 200 status code and the filtered income ranges", async () => {
        const incomeRanges = [
            { id_income_range: 1, id_country: 1, range: "0-1000" },
            { id_income_range: 2, id_country: 1, range: "1001-2000" },
        ];
        prismaMock.income_Range.findMany.mockResolvedValue(incomeRanges); // Mock findMany to return some income ranges

        const response = await request(server).get("/api/v1/getIncomeRanges").query({ id_country: 1 });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("incomeRanges");
        expect(response.body.incomeRanges).toHaveLength(2);
    });

    test("Should respond with 400 if country code format is invalid", async () => {
        const response = await request(server).get("/api/v1/getIncomeRanges").query({ id_country: "invalid" });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error", "Country code format is invalid");
    });

    test("Should respond with 404 if no income ranges exist for the provided country", async () => {
        prismaMock.income_Range.findMany.mockResolvedValue([]); // Mock findMany to return an empty array

        const response = await request(server).get("/api/v1/getIncomeRanges").query({ id_country: 1 });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "No existing income range for the country");
    });

    
});

describe("GET /api/v1/getOccupations", () => {

    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        jest.clearAllMocks();
    });

    test("Should respond with 200 status code and the filtered occupations", async () => {
        const occupations = [
            { id_occupation: 1, id_country: 1, occupation_name: "Doctor" },
            { id_occupation: 2, id_country: 1, occupation_name: "Engineer" },
        ];
        prismaMock.occupation.findMany.mockResolvedValue(occupations); 

        const response = await request(server).get("/api/v1/getOccupations").query({ id_country: 1 });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("occupations");
        expect(response.body.occupations).toHaveLength(2);
    });

    test("Should respond with 400 if country ID format is invalid", async () => {
        const response = await request(server).get("/api/v1/getOccupations").query({ id_country: "invalid" });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error", "Country ID format is invalid");
    });

    test("Should respond with 404 if no occupations exist for the provided country", async () => {
        prismaMock.occupation.findMany.mockResolvedValue([]); // Mock findMany to return an empty array

        const response = await request(server).get("/api/v1/getOccupations").query({ id_country: 1 });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "No existing occupations for the country");
    });

});

describe("GET /api/v1/getEducationalLevel", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Should respond with 200 status code and the filtered educational levels", async () => {
        const educationalLevels = [
            { id_educational_level: 1, id_country: 1, level_name: "High School" },
            { id_educational_level: 2, id_country: 1, level_name: "Bachelor's Degree" },
        ];
        prismaMock.educational_Level.findMany.mockResolvedValue(educationalLevels);

        const response = await request(server).get("/api/v1/getEducationalLevel").query({ id_country: 1 });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("educationalLevels");
        expect(response.body.educationalLevels).toHaveLength(2);
     });

    test("Should respond with 400 if country ID format is invalid", async () => {
        const response = await request(server).get("/api/v1/getEducationalLevel").query({ id_country: "invalid" });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error", "Country ID format is invalid");
     });

    test("Should respond with 404 if no educational levels exist for the provided country", async () => {
        prismaMock.educational_Level.findMany.mockResolvedValue([]);

        const response = await request(server).get("/api/v1/getEducationalLevel").query({ id_country: 1 });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "There are no educational levels available for this country ID");
    });
});

describe("GET /api/v1/getCountriesPostgres", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Should respond with 200 status code and an array of countries", async () => {
        const mockCountries = [
            { id_country: 1, name: 'Chile' },
            { id_country: 2, name: 'Country2' },
        ];
        prismaMock.country.findMany.mockResolvedValue(mockCountries);

        const response = await request(server).get('/api/v1/getCountriesPostgres');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toEqual(mockCountries);
    });


    test("Should respond with 400 if there are unexpected query parameters", async () => {
        const response = await request(server)
            .get('/api/v1/getCountriesPostgres')
            .query({ invalidParam: 'value' });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid request format');
    });
});


afterAll(() => {
    server.close();
});