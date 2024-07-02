const server = require('../index.js');
const request = require('supertest'); 
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');


// Mock PrismaClient to avoid access to the real database
jest.mock('@prisma/client', () => {

    const { mockPrismaClient } = require('../utils/mocks.js');
    
    return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

const mockMulter = multer();
mockMulter.single = jest.fn(() => (req, res, next) => {
  req.file = {
    filename: 'file.pdf',
    path: 'documents_images/file.pdf',
    originalname: 'file.pdf'
  };
  next();
});

const prismaMock = new PrismaClient();

describe("POST /api/v1/postDocuments", () => {

    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        jest.clearAllMocks();
    });

    test("Should respond with 201 and create a new document entry", async () => {
    
        prismaMock.document_Type.findFirst.mockResolvedValue({ id_document_type: 1 });
        prismaMock.investment_Account_Natural.findFirst.mockResolvedValue({ id_investment_account_natural: 1 });
        prismaMock.images_Documents.create.mockResolvedValue({
            id: 1,
            id_investment_account_natural: 1,
            img_link: '/path/to/file.pdf',
            img_name: 'file.pdf',
            img_description: 'test description',
            id_document_type: 1
        });

        const response = await request(server)
            .post("/api/v1/postDocuments")
            .attach('file', Buffer.from('file content'), 'file.pdf')
            .field('id_investment_account_natural', '1')
            .field('description', 'test description')
            .field('id_document_type', '1');

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("id", 1);
        expect(response.body).toHaveProperty("id_investment_account_natural", 1);
        expect(response.body).toHaveProperty("img_link", '/path/to/file.pdf');
        expect(response.body).toHaveProperty("img_name", 'file.pdf');
        expect(response.body).toHaveProperty("img_description", 'test description');
        expect(response.body).toHaveProperty("id_document_type", 1);
    });


    test("Should respond with 400 if no file is received", async () => {
        const response = await request(server).post("/api/v1/postDocuments").send({});

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error", "No file received");
    });

    test("Should respond with 415 if invalid file format is provided", async () => {
        const invalidFile = 'file.txt';
        const response = await request(server)
            .post("/api/v1/postDocuments")
            .attach('file', Buffer.from('file content'), invalidFile)
            .field('id_investment_account_natural', '1')
            .field('description', 'test description')
            .field('id_document_type', '1');

        expect(response.statusCode).toBe(415);
        expect(response.body).toEqual({ error: 'Invalid file format, must be .png, .jpg, or .pdf' });
    });

    test("Should respond with 404 if the investment account does not exist", async () => {
        prismaMock.document_Type.findFirst.mockResolvedValue({ id_document_type: 1 });
        prismaMock.investment_Account_Natural.findFirst.mockResolvedValue(null);

        const response = await request(server)
            .post("/api/v1/postDocuments")
            .attach('file', Buffer.from('file content'), 'file.pdf')
            .field('id_investment_account_natural', '1')
            .field('description', 'test description')
            .field('id_document_type', '1');

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ error: "The investment account natural does not exist" });
    });

    test("Should respond with 400 if invalid document type ID is provided", async () => {
        const invalidId = 'abc';
        const response = await request(server)
            .post("/api/v1/postDocuments")
            .attach('file', Buffer.from('file content'), 'file.pdf')
            .field('id_investment_account_natural', '1')
            .field('description', 'test description')
            .field('id_document_type', invalidId);

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid document type ID' });
    });

    test("Should respond with 404 if document type is not found", async () => {
        prismaMock.document_Type.findFirst.mockResolvedValue(null);

        const response = await request(server)
            .post("/api/v1/postDocuments")
            .attach('file', Buffer.from('file content'), 'file.pdf')
            .field('id_investment_account_natural', '1')
            .field('description', 'test description')
            .field('id_document_type', '1');

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "Document type not found");
    });

});

describe("GET /api/v1/getDocumentByIdAccount", () => {

    // Prueba exitosa: Documento encontrado para el ID de cuenta de inversión natural válido
    test("Should respond with 200 and return documents for valid investment account ID", async () => {
        const mockDocuments = [
            { id: 1, id_investment_account_natural: 1, img_link: "/path/to/doc1.pdf", img_name: "doc1.pdf" },
            { id: 2, id_investment_account_natural: 1, img_link: "/path/to/doc2.pdf", img_name: "doc2.pdf" }
        ];
        prismaMock.images_Documents.findMany.mockResolvedValue(mockDocuments);
        const response = await request(server).get("/api/v1/getDocumentByIdAccount").query({ id_investment_account_natural: "1" });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(mockDocuments);
    });

    // Prueba: No se encuentra ningún documento para el ID de cuenta de inversión natural dado
    test("Should respond with 404 if no documents are found for the investment account", async () => {
        prismaMock.images_Documents.findMany.mockResolvedValue([]);
        const response = await request(server).get("/api/v1/getDocumentByIdAccount").query({ id_investment_account_natural: "1" });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("message", "No documents found for the investment account");
    });

});


describe("POST /api/v1/putDocument", () => {

    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        jest.clearAllMocks();
    });

    // test("Should respond with 200 and update the document", async () => {
        
    //     prismaMock.document_Type.findUnique.mockResolvedValue({ id_document_type: 1 });

    //     const response = await request(server)
    //         .put('/api/documents')
    //         .field('id_images_documents', '1') 
    //         .attach('file', Buffer.from('file content'), 'file.pdf'); // Reemplaza con la ruta correcta

    //     console.log(response.body)
    //     console.log(response.error)
    
    //     expect(response.status).toBe(200);
    //     expect(response.body.ok).toBe(true);
    //     expect(response.body.updatedDocument).toBeDefined();
    // });


    test("Should respond with 404 if the document does not exist", async () => {
        prismaMock.images_Documents.findUnique.mockResolvedValue(null);
        const response = await request(server)
            .put("/api/v1/putDocument")
            .send({ id_images_documents: 1 });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("message", "This record does not exist");
    });
});









afterAll(() => {
    server.close();
});