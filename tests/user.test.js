const app = require('../app.js');
const request = require('supertest'); //SuperTest is used to test the Express application without starting the server 

//Test endpoint getUserPostgres - return all users
describe("GET /api/v1/getUserPostgres", () => {
  //Testing ok status code
  test("Should respond with a 200 status code", async () => {
    const response = await request(app).get("/api/v1/getUserPostgres").send();

    expect(response.statusCode).toBe(200);
  });

  test("Should respond with an array", async ()=>{
    const response = await request(app).get("/api/v1/getUserPostgres").send();

    expect(response.body).toBeInstanceOf(Array);
  });
});

//Test endpoint postUserPostgres - store a user
describe("POST /api/v1/postUserPostgres", () => {
  describe("Given a valid user", () =>{

    const validUser={
      email: "randal.test@gmail.com",
      password: "jhdshhkdhsakd", 
      terms_and_conditions: true, 
      id_profile: 2
    }


    test("Should have a content-type: application/json in header", async () =>{
      const response = await request(app).post("/api/v1/postUserPostgres").send(validUser);
  
      expect(response.header['content-type']).toEqual(expect.stringContaining("json"));
    });
  
    test("Should respond an ok json when send a new user", async ()=> {
      const response = await request(app).post("/api/v1/postUserPostgres").send(validUser);
  
      expect(response.statusCode).toBe(200);
    });
  }); 

  describe("When user is missing", () =>{
    test("Should respond with a 400 status code",() => {
      const response= request(app).post("/api/v1/postUserPostgres").send({});

      expect(response.statusCode).toBe(400);
    });
  });

});

//Test endpoint postLoginUserPostgres - login a user
describe("POST /api/v1/postLoginUserPostgres", () => {
  //Testing ok status code
  test("Should respond with a 200 status code", async () => {
    const response = await request(app).post("/api/v1/postLoginUserPostgres");

    expect(response.statusCode).toBe(200);
  });
});

//Test endpoint putUpdatePassword - update a user password
describe("PUT /api/v1/putUpdatePassword", () => {
  const userId=1;
  const newPassword={
    password: "123214jhjhfd"
  };

  //Testing ok status code
  test("Should respond with a ok json When send a valid Password", async () => {
    const response = await request(app).put(`/api/product/update/${userId}`).send(newPassword);

    expect(response.statusCode).toBe(200);
  });
});

