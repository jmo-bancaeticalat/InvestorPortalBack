const server = require('../index.js');
const request = require('supertest'); //SuperTest is used to test the Express application without starting the server 

describe("GET /api/v1/getIncomeRanges", () => {

    test("Should respond with 200 status code and the filtered income ranges", async () => {
        const response = await request(server)
            .get("/api/v1/getIncomeRanges")
            .query({ id_country: 39 });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("incomeRanges");
        expect(Array.isArray(response.body.incomeRanges)).toBe(true);

        // Additional checks to ensure the filtered results match the provided country ID
        response.body.incomeRanges.forEach(incomeRange => {
            expect(incomeRange.id_country).toBe(39);
        });
    });

    test("Should respond with 400 if country code format is invalid", async () => {
        const response = await request(server)
            .get("/api/v1/getIncomeRanges")
            .query({ id_country: "abc" });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error", "Country code format is invalid");
    });

    test("Should respond with 404 if no income ranges exist for the provided country", async () => {
        const response = await request(server)
            .get("/api/v1/getIncomeRanges")
            .query({ id_country: 999 });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "No existing income range for the country");
    });

    
});

describe("GET /api/v1/getOccupations", () => {

    test("Should respond with 200 status code and the filtered occupations", async () => {
        const response = await request(server)
            .get("/api/v1/getOccupations")
            .query({ id_country: 39 });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("occupations");
        expect(Array.isArray(response.body.occupations)).toBe(true);
        // Additional checks to ensure the filtered results match the provided country ID
        response.body.occupations.forEach(occupation => {
            expect(occupation.id_country).toBe(39);
        });
    });

    test("Should respond with 400 if country ID format is invalid", async () => {
        const response = await request(server)
            .get("/api/v1/getOccupations")
            .query({ id_country: "abc" });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error", "Country ID format is invalid");
    });

    test("Should respond with 404 if no occupations exist for the provided country", async () => {
        const response = await request(server)
            .get("/api/v1/getOccupations")
            .query({ id_country: 999 });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "No existing occupations for the country");
    });

});

describe("GET /api/v1/getEducationalLevel", () => {

    test("Should respond with 200 status code and the filtered educational levels", async () => {
        const response = await request(server)
            .get("/api/v1/getEducationalLevel")
            .query({ id_country: 39 });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("educationalLevels");
        expect(Array.isArray(response.body.educationalLevels)).toBe(true);
        // Additional checks to ensure the filtered results match the provided country ID
        response.body.educationalLevels.forEach(level => {
            expect(level.id_country).toBe(39);
        });
    });

    test("Should respond with 400 if country ID format is invalid", async () => {
        const response = await request(server)
            .get("/api/v1/getEducationalLevel")
            .query({ id_country: "abc" });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error", "Country ID format is invalid");
    });

    test("Should respond with 404 if no educational levels exist for the provided country", async () => {
        const response = await request(server)
            .get("/api/v1/getEducationalLevel")
            .query({ id_country: 999 });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "There are no educational levels available for this country ID");
    });
});




afterAll(() => {
    server.close();
});