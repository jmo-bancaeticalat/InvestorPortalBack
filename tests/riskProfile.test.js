const app = require('../app.js');
const request = require('supertest'); //SuperTest is used to test the Express application without starting the server 

//Test endpoint getRiskProfileQuestions - return all profile questions
describe("GET /api/v1/getRiskProfileQuestions", () => {
    //Testing ok status code
    test("Should respond with a 200 status code", async () => {
      const response = await request(app).get("/api/v1/getRiskProfileQuestions");
  
      expect(response.statusCode).toBe(200);
    });
});

//Test endpoint getAnswersRiskQuestions - return all answers of a specific risk questions
describe("GET /api/v1/getAnswersRiskQuestions", () => {
    //Testing ok status code
    test("Should respond with a 200 status code", async () => {
      const response = await request(app).get("/api/v1/getAnswersRiskQuestions");
  
      expect(response.statusCode).toBe(200);
    });
});
  
//Test endpoint getRiskProfileQuestionSelection - return all selection of a specific risk questions
describe("GET /api/v1/getRiskProfileQuestionSelection", () => {
    //Testing ok status code
    test("Should respond with a 200 status code", async () => {
      const response = await request(app).get("/api/v1/getRiskProfileQuestionSelection");
  
      expect(response.statusCode).toBe(200);
    });
});

//Test endpoint getRiskProfile - return risk profile of account
describe("GET /api/v1/getRiskProfile", () => {
    //Testing ok status code
    test("Should respond with a 200 status code", async () => {
      const response = await request(app).get("/api/v1/getRiskProfile");
  
      expect(response.statusCode).toBe(200);
    });
});

//Test endpoint getScales - return all scales of risk profile definition
describe("GET /api/v1/getScales", () => {
    //Testing ok status code
    test("Should respond with a 200 status code", async () => {
      const response = await request(app).get("/api/v1/getScales");
  
      expect(response.statusCode).toBe(200);
    });
});

//Test endpoint postRiskProfileForAccount - store risk profile of account
describe("GET /api/v1/postRiskProfileForAccount", () => {
    //Testing ok status code
    test("Should respond with a 200 status code", async () => {
      const response = await request(app).get("/api/v1/postRiskProfileForAccount");
  
      expect(response.statusCode).toBe(200);
    });
});

//Test endpoint postRiskProfileQuestionSelection - store selection of a specific risk questions
describe("GET /api/v1/postRiskProfileQuestionSelection", () => {
    //Testing ok status code
    test("Should respond with a 200 status code", async () => {
      const response = await request(app).get("/api/v1/postRiskProfileQuestionSelection");
  
      expect(response.statusCode).toBe(200);
    });
});

//Test endpoint UpdateRiskProfileScale - store risk profile of account
describe("GET /api/v1/UpdateRiskProfileScale", () => {
    //Testing ok status code
    test("Should respond with a 200 status code", async () => {
      const response = await request(app).get("/api/v1/UpdateRiskProfileScale");
  
      expect(response.statusCode).toBe(200);
    });
});