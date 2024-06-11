const server = require('../index.js');
const request = require('supertest'); //SuperTest is used to test the Express application without starting the server 
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const {
  clearTestUser
} = require('../controllers/user.controller.js')

describe("POST /api/v1/postUserPostgres", () => {

  // Antes de cada prueba, elimina el usuario si existe
  beforeEach(async () => {
    await clearTestUser();
  });

  // Prueba si se crea un nuevo usuario correctamente
  test("Should create a new user with 201 Ok: true", async () => {

    const newUser = {
      email: "test@example.com", 
      password: "Test123!",
      terms_and_conditions: true,
    };

    const response = await request(server)
      .post("/api/v1/postUserPostgres")
      .send(newUser);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("ok", true);
    expect(response.body).toHaveProperty("createdUser");
    expect(response.body.createdUser).toHaveProperty("email", newUser.email);

    // Almacena el ID del usuario creado
    createdUserId = response.body.createdUser.id;
  });

  // Prueba si se manejan los casos de error correctamente
  test("Should respond with 400 if email is missing", async () => {
    const userWithoutEmail = {
      password: "Test123!",
      terms_and_conditions: true,
    };

    const response = await request(server)
      .post("/api/v1/postUserPostgres")
      .send(userWithoutEmail);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "Email is required");
  });

  test("Should respond with 400 if password is missing", async () => {
    const userWithoutPassword = {
      email: "test@example.com",
      terms_and_conditions: true,
    }

    const response = await request(server)
    .post("/api/v1/postUserPostgres")
    .send(userWithoutPassword);

    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty("error", "Password is required");
  });

  test("Should respond with 400 if terms and conditions are not accepted", async () => {
    const userWithoutTerms = {
      email: "test@example.com",
      password: "Test123!",
      terms_and_conditions: false,
    };
  
    const response = await request(server)
      .post("/api/v1/postUserPostgres")
      .send(userWithoutTerms);
  
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "Accepting the terms and conditions is required");
  });
  
  test("Should respond with 400 if email is invalid", async () => {
    const userWithInvalidEmail = {
      email: "invalid-email",
      password: "Test123!",
      terms_and_conditions: true,
    };
  
    const response = await request(server)
      .post("/api/v1/postUserPostgres")
      .send(userWithInvalidEmail);
  
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "Invalid email");
  });
  
  test("Should respond with 400 if terms and conditions are invalid", async () => {
    const userWithInvalidTerms = {
      email: "test@example.com",
      password: "Test123!",
      terms_and_conditions: "not-a-boolean", 
    };
  
    const response = await request(server)
      .post("/api/v1/postUserPostgres")
      .send(userWithInvalidTerms);
  
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "Invalid terms and conditions");
  });

  test("Should respond with 400 if password is too short", async () => {
    const userWithShortPassword = {
      email: "test@example.com",
      password: "Short1!",
      terms_and_conditions: true,
    };
  
    const response = await request(server)
      .post("/api/v1/postUserPostgres")
      .send(userWithShortPassword);
  
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "Password must be at least 8 characters long.");
  });

  test("Should respond with 400 if password is missing a lowercase letter", async () => {
    const userWithNoLowercase = {
      email: "test@example.com",
      password: "TEST123!",
      terms_and_conditions: true,
    };
  
    const response = await request(server)
      .post("/api/v1/postUserPostgres")
      .send(userWithNoLowercase);
  
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "Password must contain at least one lowercase letter.");
  });
  
  test("Should respond with 400 if password is missing an uppercase letter", async () => {
    const userWithNoUppercase = {
      email: "test@example.com",
      password: "test123!",
      terms_and_conditions: true,
    };
  
    const response = await request(server)
      .post("/api/v1/postUserPostgres")
      .send(userWithNoUppercase);
  
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "Password must contain at least one uppercase letter.");
  });
  
  test("Should respond with 400 if password is missing a number", async () => {
    const userWithNoNumber = {
      email: "test@example.com",
      password: "Testtest!",
      terms_and_conditions: true,
    };
  
    const response = await request(server)
      .post("/api/v1/postUserPostgres")
      .send(userWithNoNumber);
  
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "Password must contain at least one number.");
  });

  test("Should respond with 400 if password is missing a special character", async () => {
    const userWithNoSpecialChar = {
      email: "test@example.com",
      password: "Test1234",
      terms_and_conditions: true,
    };
  
    const response = await request(server)
      .post("/api/v1/postUserPostgres")
      .send(userWithNoSpecialChar);
  
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "Password must contain at least one special character (@$!%*?&.).");
  });

  test("Should respond with 404 if user with email already exists", async () => {
    const existingUser = {
      email: "test@example.com",
      password: "Test123!",
      terms_and_conditions: true,
      registration_date: new Date(),
      profile: {
        connect: {id_profile: 2}
      }
    };
  
    // Crear un usuario existente
    await prisma.user.create({
      data: existingUser,
    });
  
    // Intentar crear el mismo usuario otra vez
    const response = await request(server)
      .post("/api/v1/postUserPostgres")
      .send(existingUser);
  
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("error", "There is already a user created with this email");
  });
  
});

//Test endpoint getUserPostgres - return all users
describe("GET /api/v1/getUserPostgres", () => {
  //Testing ok status code
  test("Should respond with a 200 status code and user information", async () => {
    const response = await request(server).get("/api/v1/getUserPostgres?id_user=1").send();
    expect(response.body[0]).toHaveProperty("id_user");
    expect(response.body[0]).toHaveProperty("profile");
    expect(response.body[0].profile).toHaveProperty("name");
    expect(response.statusCode).toBe(200);
  });

  test("Should respond with an array", async ()=>{
    const response = await request(server).get("/api/v1/getUserPostgres?id_user=1").send();
    expect(response.body).toBeInstanceOf(Array);
  });

  test("Should respond with 400 if user ID is missing", async () => {
    const response = await request(server).get("/api/v1/getUserPostgres?id_user=").send();

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "User ID is required");
  });

  test("Should respond with 400 if user ID is invalid", async () => {
    const response = await request(server).get("/api/v1/getUserPostgres?id_user=abc").send(); 

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "Invalid User ID");
  });

  test("Should respond with 404 if user is not found", async () => {
    const response = await request(server).get("/api/v1/getUserPostgres?id_user=999").send(); 

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("error", "User not found");
  });


});

//!Comment for failure jest with jenkins
//Test endpoint postUserPostgres - store a user
/* describe("POST /api/v1/postUserPostgres", () => {
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

}); */

//Test endpoint postLoginUserPostgres - login a user
/* describe("POST /api/v1/postLoginUserPostgres", () => {
  //Testing ok status code
  test("Should respond with a 200 status code", async () => {
    const response = await request(server).post("/api/v1/postLoginUserPostgres");

    expect(response.statusCode).toBe(200);
  });
}); */

//Test endpoint putUpdatePassword - update a user password
/* describe("PUT /api/v1/putUpdatePassword", () => {
  const userId=1;
  const newPassword={
    password: "123214jhjhfd"
  };

  //Testing ok status code
  test("Should respond with a ok json When send a valid Password", async () => {
    const response = await request(server).put(`/api/product/update/${userId}`).send(newPassword);

    expect(response.statusCode).toBe(200);
  });
}); */

afterAll(() => {
  server.close();
 });
