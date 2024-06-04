# Backend single registration and commercial backoffice Latin American Ethical Banking

This system constitutes the backend infrastructure to support both our control panel (backoffice) and our main user interface ([frontend](https://github.com/randalBELAT/RegistroUnicoFront)). The application is developed and run in [Node.js](https://nodejs.org/en), providing the solid foundation necessary for processing and storing data, as well as managing essential system operations.

## Requirements

- [Node](https://nodejs.org/en) >= 16.13
- Npm >= 6.13.4 o Yarn >= 1.21.1

## Installation

In order to install our Backend platform locally, the following steps must be followed:

1. Clone our repository to have the files of our platform in your local environment

```bash
git clone https://github.com/randalBELAT/RegistroUnicoBack.git
```

2. Install the npm dependencies

```bash
npm install
```

3. Install [Prisma](https://www.prisma.io/docs/getting-started/quickstart)

```bash
npm install prisma --save-dev
```

- For the generation of the prisma model: 

```bash
npx prisma generate
```

4. Install [Axios](https://axios-http.com/docs/intro)

```bash
npm install axios
```

5. Install [Bcrypt](https://www.npmjs.com/package/bcryptjs)

```bash
npm install bcryptjs
```

6. Install [Convert-excel-to-json](https://www.npmjs.com/package/convert-excel-to-json)

```bash
npm install convert-excel-to-json
```

7. Install [Cookie-parser](https://expressjs.com/en/resources/middleware/cookie-parser.html#:~:text=cookie-parser%201%20Installation%20%24%20npm%20install%20cookie-parser%202,secret.%20...%203%20Example%20...%204%20License%20)

```bash
npm install cookie-parser
```

8. Install [Cors](https://www.npmjs.com/package/cors)

```bash
npm install cors
```

9. Install [Dotenv](https://www.npmjs.com/package/dotenv)

```bash
npm install dotenv --save
```

10. Install [Express](https://expressjs.com/en/starter/installing.html)

```bash
npm install express
```

11. Install [Express-session](https://www.npmjs.com/package/express-session)

```bash
npm install express-session
```

12. Install [Express-validator](https://express-validator.github.io/docs/)

```bash
npm install express-validator
```

13. Install [Googleapis](https://www.npmjs.com/package/googleapis)

```bash
npm install googleapis
```

14. Install [Gridfs-stream](https://www.npmjs.com/package/gridfs-stream)

```bash
npm install gridfs-stream
```

15. Install [Jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)

```bash
npm install jsonwebtoken
```

16. Install [keycloak-connect](https://www.npmjs.com/package/keycloak-connect)

```bash
npm install keycloak-connect --save
```

17. Install [Mongoose](https://www.npmjs.com/package/mongoose)

```bash
npm install mongoose
```

18. Install [Multer](https://www.npmjs.com/package/multer)

```bash
npm install --save multer
```

19. Install [Nodemailer](https://nodemailer.com/about/)

```bash
npm install nodemailer
```

20. Install [Nodemon](https://www.npmjs.com/package/nodemon)

```bash
npm install -g nodemon
```

21. Install [Pg](https://www.npmjs.com/package/pg)

```bash
npm install pg
```

22. Install [Xlsx](https://www.npmjs.com/package/xlsx)

```bash
npm install xlsx
```

23. Install [Swagger-JSDoc](https://www.npmjs.com/package/swagger-jsdoc) to document the API

```bash
npm install swagger-jsdoc
```

24. Install [Swagger UI Express](https://www.npmjs.com/package/swagger-ui-express) to display the Swagger UI

```bash
npm install swagger-ui-express
```

25. Install [Jest](https://www.npmjs.com/package/jest) to testing the application

```bash
npm install jest
```

26. Install [Supertest](https://www.npmjs.com/package/supertest) to test the endpoints of Rest API

```bash
npm install supertest
```

## Initializing Development Environment

After completing the installation steps, you can now initiate the application.
Use the following command to start the project and preview it in your browser:

```bash
npm run dev
```

## Endpoint Testing - Jest and Supertest

To test the endpoints, you can use the following command:

```bash
npm run test
```

## Endpoint Use Example

To get a list of available countries in the API, you can make a GET request to the following endpoint:

```bash
GET http://localhost:5000/api/v1/getCountries
```

## API documentation

To  view the API documentation, navigate to the following URL: http://localhost:5000/api/v1/doc