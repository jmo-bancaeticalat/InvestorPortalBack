const server = require('../index.js');
const request = require('supertest'); 

const {
    testDeletRelationship
  } = require('../controllers/person.controller.js');

describe("POST /api/v1/postRelationshipNaturalLegal", () => {
    
    beforeEach(async () => {
        await testDeletRelationship();
    });

    test("Should respond with 200 and create the relationship for valid IDs", async () => {

        const response = await request(server)
            .post("/api/v1/postRelationshipNaturalLegal")
            .send({
                id_natural_person: 1,
                id_legal_person: 1,
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('ok', true);
        expect(response.body).toHaveProperty('createRelationship');
    });

    test("Should respond with 404 if the natural person does not exist", async () => {
        const response = await request(server)
            .post("/api/v1/postRelationshipNaturalLegal")
            .send({ id_natural_person: 999999, id_legal_person: 1 });

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ error: 'The natural person does not exist' });
    });

    test("Should respond with 404 if the legal person does not exist", async () => {
        const response = await request(server)
            .post("/api/v1/postRelationshipNaturalLegal")
            .send({ id_natural_person: 1, id_legal_person: 999999 });

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ error: 'The legal person does not exist' });
    });

    test("Should respond with 409 if the relationship already exists", async () => {

        const response = await request(server)
            .post("/api/v1/postRelationshipNaturalLegal")
            .send({
                id_natural_person: 2,
                id_legal_person: 2,
            });

        expect(response.statusCode).toBe(409);
        expect(response.body).toEqual({ error: 'The relationship between the natural person and the legal person already exists' });
    });
});

describe("PUT /api/v1/putLegalPerson", () => {

    test("Should respond with 200 and update the legal person for valid ID and date", async () => {

        const response = await request(server)
            .put("/api/v1/putLegalPerson")
            .send({
                id_legal_person: 2,
                company_creation_date: '2024-06-17T00:00:00.000Z',
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('ok', true);
        expect(response.body.updatedLegalPerson).toHaveProperty('company_creation_date', '2024-06-17T00:00:00.000Z');
    });

        // Prueba: Persona jurídica no encontrada
        test("Should respond with 404 if the legal person does not exist", async () => {
            const response = await request(server)
                .put("/api/v1/putLegalPerson")
                .send({ id_legal_person: 999999, company_creation_date: '2024-06-17T00:00:00.000Z' });
    
            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({ error: 'The legal person does not exist' });
        });
});

afterAll(() => {
    server.close();
});