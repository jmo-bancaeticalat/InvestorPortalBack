const server = require('../index.js');
const request = require('supertest'); //SuperTest is used to test the Express application without starting the server 
const jwt = require('jsonwebtoken');

const {
    generateToken
  } = require('../controllers/mail.controller.js');

describe("GET /api/v1/getVerifyToken", () => {

    const email = 'test@example.com'


    test("Should respond with 200 and 'Email verified successfully' for valid token and email", async () => {
        
        const token = await generateToken(email)

        const response = await request(server)
            .get("/api/v1/getVerifyToken")
            .query({ token, email });

        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Email verified successfully');
    });

    test("Should respond with 400 if token is missing", async () => {

        const response = await request(server)
            .get("/api/v1/getVerifyToken")
            .query({ email });

        expect(response.statusCode).toBe(400);
        expect(response.text).toBe('Missing token');
    });

    test("Should respond with 400 if email is missing", async () => {

        const token = await generateToken(email)
        
        const response = await request(server)
            .get("/api/v1/getVerifyToken")
            .query({ token });

        expect(response.statusCode).toBe(400);
        expect(response.text).toBe('Missing email');
    });

    test("Should respond with 401 if token has expired", async () => {

        const token = jwt.sign({ email: 'test@example.com' }, process.env.JWT_SECRET, { expiresIn: '-1s' });

        const response = await request(server)
            .get("/api/v1/getVerifyToken")
            .query({ token, email });

        expect(response.statusCode).toBe(401);
        expect(response.text).toBe('Token has expired');
    });

    test("Should respond with 400 if token is invalid", async () => {

        const token = 'invalid-token';

        const response = await request(server)
            .get("/api/v1/getVerifyToken")
            .query({ token, email: 'test@example.com' });

        expect(response.statusCode).toBe(400);
        expect(response.text).toBe('Invalid token');
    });

    test("Should respond with 400 if email does not match token", async () => {
        
        const token = await generateToken(email)
    
        const response = await request(server)
            .get("/api/v1/getVerifyToken")
            .query({ token, email: 'different-email@example.com' });
    
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe('Email does not match token');
    });
});










afterAll(() => {
    server.close();
});