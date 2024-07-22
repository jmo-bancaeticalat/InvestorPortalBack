require('dotenv').config();
const express = require('express');
const authRouter = require('./routes/auth.route.js');
const personRouter = require('./routes/person.route.js');
const profileRouter = require('./routes/profile.route.js');
const userRouter = require('./routes/user.route.js');
const mailRouter = require('./routes/mail.route.js');
const accountRouter = require('./routes/account.route.js');
const documentRouter = require('./routes/document.route.js');
const riskProfileRouter = require('./routes/riskProfile.route.js');
const auxiliarRouter = require('./routes/auxiliar.route.js');
const synchronousFunctionsRouter = require('./routes/synchronousFunctions.route.js');
const secureRouter = require('./routes/secure.route.js');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');

//Swagger
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

//Metadata info about API
const options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title:  "API Investor Portal Backend",
            version: "1.0.0",
            description: "This is a API of the investor portal, provide all the necessary endpoints",
        },
        servers: [
            {
              url: "http://localhost:5000/api/v1", //Server for development enviroment
            },
        ],
    },
    
    apis: ["./swagger-docs/**/*.yaml"], // paths to your files  
};


const prisma = new PrismaClient();

// Función para obtener todos los registros de una tabla

const app = express();

const whiteList = [process.env.ORIGIN1, process.env.ORIGIN2, process.env.ORIGIN3, process.env.ORIGIN4];

app.use(
    cors({
        origin: function(origin, callback){
            if(!origin || whiteList.includes(origin)){
                return callback(null, origin);
            }
            return callback("Error de CORS origin: " + origin + "No autorizado!");
        },
    credentials: true,
}));
app.use('/api/v1/doc', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(options)));
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1', authRouter);
app.use('/api/v1', personRouter);
app.use('/api/v1', profileRouter);
app.use('/api/v1', userRouter);
app.use('/api/v1', mailRouter);
app.use('/api/v1', accountRouter);
app.use('/api/v1', documentRouter);
app.use('/api/v1', riskProfileRouter);
app.use('/api/v1', auxiliarRouter);
app.use('/api/v1', synchronousFunctionsRouter);

//Solo para test login
app.use(express.static('public'));



app.get("/", (req,res) => {
    res.json({ok: true});
})

module.exports = app;