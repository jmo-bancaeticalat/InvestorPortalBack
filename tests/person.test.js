const server = require('../index.js');
const request = require('supertest'); 
const { PrismaClient } = require('@prisma/client');

// Mockear PrismaClient para evitar el acceso a la base de datos real
jest.mock('@prisma/client', () => {

    const { mockPrismaClient } = require('../utils/mocks.js');
    
    return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

const prismaMock = new PrismaClient();


describe("POST /api/v1/postRelationshipNaturalLegal", () => {

    beforeEach(() => {
        jest.clearAllMocks(); // Limpiar todos los mocks antes de cada prueba
    });

    test("Should respond with 200 and create the relationship for valid IDs", async () => {
        // Mockear prisma.natural_Person.findUnique
        prismaMock.natural_Person.findUnique.mockResolvedValue({
            id_natural_person: 1,
        });

        // Mockear prisma.legal_Person.findUnique
        prismaMock.legal_Person.findUnique.mockResolvedValue({
            id_legal_person: 1,
        });

        // Mockear prisma.relationship_Natural_Legal.findFirst
        prismaMock.relationship_Natural_Legal.findFirst.mockResolvedValue(null);

        // Mockear prisma.relationship_Natural_Legal.create
        prismaMock.relationship_Natural_Legal.create.mockResolvedValue({
            id_relationship: 1,
            id_natural_person: 1,
            id_legal_person: 1,
        });

        // Simular la solicitud HTTP
        const response = await request(server)
            .post("/api/v1/postRelationshipNaturalLegal")
            .send({
                id_natural_person: 1,
                id_legal_person: 1,
            });

        // Verificar que la respuesta sea 200 OK
        expect(response.statusCode).toBe(200);
        // Verificar que la respuesta tenga las propiedades esperadas
        expect(response.body).toHaveProperty('ok', true);
        expect(response.body).toHaveProperty('createRelationship');

        // Verificar que se llamaron a los métodos de Prisma esperados
        expect(prismaMock.natural_Person.findUnique).toHaveBeenCalledWith({
            where: { id_natural_person: 1 },
        });
        expect(prismaMock.legal_Person.findUnique).toHaveBeenCalledWith({
            where: { id_legal_person: 1 },
        });
        expect(prismaMock.relationship_Natural_Legal.findFirst).toHaveBeenCalledWith({
            where: {
                id_natural_person: 1,
                id_legal_person: 1,
            },
        });
        expect(prismaMock.relationship_Natural_Legal.create).toHaveBeenCalledWith({
            data: {
                id_natural_person: 1,
                id_legal_person: 1,
            },
        });
    });

    test("Should respond with 404 if the natural person does not exist", async () => {
        
        // Mockear prisma.natural_Person.findUnique
        prismaMock.natural_Person.findUnique.mockResolvedValue(null);

        const response = await request(server)
            .post("/api/v1/postRelationshipNaturalLegal")
            .send({ id_natural_person: 999999, id_legal_person: 1 });

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ error: 'The natural person does not exist' });
    });

    test("Should respond with 404 if the legal person does not exist", async () => {
        // Mockear prisma.natural_Person.findUnique
        prismaMock.natural_Person.findUnique.mockResolvedValue({
            id_natural_person: 1,
        });

        // Mockear prisma.legal_Person.findUnique
        prismaMock.legal_Person.findUnique.mockResolvedValue(null);

        const response = await request(server)
            .post("/api/v1/postRelationshipNaturalLegal")
            .send({ id_natural_person: 1, id_legal_person: 999999 });

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ error: 'The legal person does not exist' });
    });

    test("Should respond with 409 if the relationship already exists", async () => {
        // Mock the existing relationship
        prismaMock.relationship_Natural_Legal.findFirst.mockResolvedValue({
          id_relationship: 1,
          id_natural_person: 2,
          id_legal_person: 2,
        });
        prismaMock.natural_Person.findUnique.mockResolvedValue({
            id_natural_person: 2,
        });

        prismaMock.legal_Person.findUnique.mockResolvedValue({
            id_legal_person: 2,
        });
      
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

    beforeEach(() => {
        jest.clearAllMocks(); // Limpiar todos los mocks antes de cada prueba
    });

    test("Should respond with 200 and update the legal person for valid ID and date", async () => {
        
        // Mockear prisma.legal_Person.update
        prismaMock.legal_Person.update.mockResolvedValue({
            id_legal_person: 2,
            company_creation_date: '2024-06-17T00:00:00.000Z',
        });

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

    test("Should respond with 404 if the legal person does not exist", async () => {
        // Mockear prisma.legal_Person.findUnique
        prismaMock.legal_Person.findUnique.mockResolvedValue(null);

        const response = await request(server)
            .put("/api/v1/putLegalPerson")
            .send({ id_legal_person: 999999, company_creation_date: '2024-06-17T00:00:00.000Z' });
    
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ error: 'The legal person does not exist' });
    });
});

describe("POST /api/v1/postLegalPerson", () => {

    beforeEach(async () => {
        jest.clearAllMocks(); // Limpiar todos los mocks antes de cada prueba
    });

    test("Should respond with 200 and create the legal person for valid company creation date", async () => {
        
        // Mockear prisma.legal_Person.create
        prismaMock.legal_Person.create.mockResolvedValue({
            id_legal_person: 1,
            company_creation_date: '2024-01-01T00:00:00.000Z',
        });

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

    beforeEach(() => {
        jest.clearAllMocks(); // Limpiar todos los mocks antes de cada prueba
    });

    test("Should respond with 200 and update the natural person for valid data", async () => {
        
        // Mockear prisma.natural_Person.update
        prismaMock.natural_Person.update.mockResolvedValue({
            id_natural_person: 1,
            cell_phone: "+34987654321",
            birthday: "2023-01-01T12:00:00.000Z",
            usa_citizen: false,
            id_country_residence: 2,
            id_country_nationality: 2,
            id_gender: 2,
            id_civil_status: 2
        });

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
        // Mockear prisma.natural_Person.findUnique
        prismaMock.natural_Person.findUnique.mockResolvedValue(null);

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
            });
            
        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty('error', 'The natural person does not exist');    
    });

    test("Should respond with 400 if no fields are sent to update", async () => {
        const response = await request(server)
            .put("/api/v1/updateNaturalPerson")
            .send({
                id_natural_person: 1,
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error', 'At least one field must be provided for the update of the natural person.');    
    });
});

describe("GET /api/v1/getNaturalPersonPostgres", () => {

    beforeEach(() => {
        jest.clearAllMocks(); // Limpiar todos los mocks antes de cada prueba
    });

    test("must respond with 200 and the natural person who obtained it", async () => {
        // Mockear prisma.natural_Person.findUnique
        prismaMock.natural_Person.findUnique.mockResolvedValue({
            id_natural_person: 1
        });

        const response = await request(server)
            .get("/api/v1/getNaturalPersonPostgres?id_natural_person=1");

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("id_natural_person");    
    });

    test("must respond with 404 if the natural person does not exist", async () => {
        // Mockear prisma.natural_Person.findUnique
        prismaMock.natural_Person.findUnique.mockResolvedValue(null);

        const response = await request(server)
            .get("/api/v1/getNaturalPersonPostgres?id_natural_person=999");

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("error", "The natural person does not exist");    
    });
});

describe("POST /api/v1/postNaturalPersonPostgres", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Limpiar todos los mocks antes de cada prueba
    });

    test("should create a new natural person and respond with 201 status code", async () => {
        const postData = {
            name: "Pepe",
            lastname: "Oberreuter",
            id_user: 1
        };

        // Mock de prisma.user.findUnique
        prismaMock.user.findUnique.mockResolvedValue({
            id_user: 1,
            email: "example@example.com",
            password: "password",
            registration_date: new Date(),
            terms_and_conditions: true,
            id_profile: 1,
        });

        // Mock de prisma.natural_Person.findFirst
        prismaMock.natural_Person.findFirst.mockResolvedValue(null);

        // Mock de prisma.natural_Person.create
        prismaMock.natural_Person.create.mockResolvedValue({
            id_natural_person: 1,
            ...postData
        });

        const response = await request(server)
            .post("/api/v1/postNaturalPersonPostgres")
            .send(postData);

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("id_natural_person");

        // Verifica que user.findUnique haya sido llamado correctamente
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
            where: { id_user: 1 }
        });

        // Verifica que natural_Person.findFirst haya sido llamado correctamente
        expect(prismaMock.natural_Person.findFirst).toHaveBeenCalledWith({
            where: { id_user: 1 }
        });

        // Verifica que natural_Person.create haya sido llamado correctamente con los datos esperados
        expect(prismaMock.natural_Person.create).toHaveBeenCalledWith({
            data: {
                name: "Pepe",
                lastname: "Oberreuter",
                user: { connect: { id_user: 1 } },
                country_residence: { connect: { id_country: 0 } },
                country_nationality: { connect: { id_country: 0 } },
                gender: { connect: { id_gender: 0 } },
                civil_status: { connect: { id_civil_status: 0 } },
            }
        });
    });
});


afterAll(() => {
    server.close();
});
