const app = require('../app.js');
const request = require('supertest'); //SuperTest is used to test the Express application without starting the server 

//Test endpoint getProfilesPostgres - return profile of a specific account
describe("GET /api/v1/getProfilesPostgres", () => {

    //Testing ok status code
    test("Should respond with a 200 status code", async () => {
      const response = await request(app).get("/api/v1/getProfilesPostgres");
  
      expect(response.statusCode).toBe(200);
    });
});

afterAll(() => {
  app.close();
  done();
 });