const server = require('../index.js');
const request = require('supertest'); 

const {
    testDeletRelationship,
    testDeletLegalPerson
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

describe("POST /api/v1/postLegalPerson", () => {

    beforeEach(async () => {
        await testDeletLegalPerson();
    });

    // Prueba exitosa: Creación correcta de la entidad legal
    test("Should respond with 200 and create the legal person for valid company creation date", async () => {
        const response = await request(server)
            .post("/api/v1/postLegalPerson")
            .send({
                company_creation_date: '2024-01-01T00:00:00.000Z',
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('ok', true);
        expect(response.body.createLegalPerson).toHaveProperty('company_creation_date', '2024-01-01T00:00:00.000Z');

    });
});

describe("PUT /api/v1/updateNaturalPerson", () => {

    test("Should respond with 200 and update the natural person for valid data", async () => {

        const response = await request(server)
            .put("/api/v1/updateNaturalPerson")
            .send({
                id_natural_person: 1,
                cell_phone: "+34987654321",
                birthday: "2023-01-01T12:00:00.000Z",
                usa_citizen: false,
                id_country_residence: 2,
                id_country_nationality: 2,
                id_gender: 2,
                id_civil_status: 2
            });
 
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('message', 'Natural person correctly updated');    
    });

    test("Should respond with 404 if the natural person does not exist", async () => {
        const response = await request(server)
            .put("/api/v1/updateNaturalPerson")
            .send({
                id_natural_person: 999,
                cell_phone: "+34987654321",
                birthday: "2023-01-01T12:00:00.000Z",
                usa_citizen: false,
                id_country_residence: 2,
                id_country_nationality: 2,
                id_gender: 2,
                id_civil_status: 2
            })
            
        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty('error', 'The natural person does not exist');    
    });

    test("Should respond 400 if no fields are sent to update", async () => {
        const response = await request(server)
            .put("/api/v1/updateNaturalPerson")
            .send({
                id_natural_person: 1,
            })

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error', 'At least one field must be provided for the update of the natural person.');    
    });

});

afterAll(() => {
    server.close();
});