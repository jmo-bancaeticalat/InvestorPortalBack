const server = require('../index.js');
const request = require('supertest'); //SuperTest is used to test the Express application without starting the server 

// describe("POST /api/v1/postDocuments", () => {

// });

describe("GET /api/v1/getDocumentByIdAccount", () => {

    // Prueba exitosa: Documento encontrado para el ID de cuenta de inversión natural válido
    test("Should respond with 200 and return documents for valid investment account ID", async () => {
        const response = await request(server)
            .get("/api/v1/getDocumentByIdAccount")
            .query({ id_investment_account_natural: 7 }); // Ajustar ID válido según tus datos de prueba

        expect(response.statusCode).toBe(200);
        expect(response.body[0]).toHaveProperty('img_name');
        expect(response.body[0]).toHaveProperty('img_description');
        expect(response.body[0]).toHaveProperty('img_link');
        expect(response.body[0]).toHaveProperty('id_document_type');


    });

    // Prueba: No se encuentra ningún documento para el ID de cuenta de inversión natural dado
    test("Should respond with 404 if no documents are found for the investment account", async () => {
        const response = await request(server)
            .get("/api/v1/getDocumentByIdAccount")
            .query({ id_investment_account_natural: 999999 }); // ID que no existe en la base de datos

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty('message', 'No documents found for the investment account');
    });

});


// describe("POST /api/v1/putDocument", () => {

// });









afterAll(() => {
    server.close();
});