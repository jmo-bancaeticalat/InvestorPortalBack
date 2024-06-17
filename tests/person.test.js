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

afterAll(() => {
    server.close();
});