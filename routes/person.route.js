const express = require('express');
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const excelToJson = require('convert-excel-to-json');
const { requireToken } = require('../middlewares/requireToken.js');

//Models
const { File } = require('../models/File.js');
const { TestFile } = require('../models/TestFile.js');

// Import upload
const { upload } = require('../controllers/document.controller.js')

// Variables
const router = express.Router();
const prisma = new PrismaClient(); // PostgreSQL Database


//Controllers
const {
  postRelationshipNaturalLegal,
  putLegalPerson,
  postLegalPerson,
  updateNaturalPerson,
  getNaturalPersonPostgres,
  postNaturalPersonPostgres,
  registerPerson, 
  registerPersonAmlCheck, 
  registerPersonBasicInfo, 
  registerPersonDeclarations, 
  registerPersonIdentityVerification, 
  registerPersonPersonalData, 
  registerPersonUserValidation, 
  registerPersonInvestmentPlatformIntegration, 
  getPersons, 
  getCountries, 
  updateManagementPerson, 
  updateNamePerson, 
  updateLastNamePerson, 
  updateLastNamePersonPost, 
  updatePhonePerson, 
  updatePhonePersonPost,
  updateAddressPerson, 
  updateAddressPersonPost,
  updateInversorProfilePerson, 
  updateInversorProfilePersonPost, 
  updateResponsibleExecutivePerson, 
  updateResponsibleExecutivePersonPost, 
  updateInversorStatePerson, 
  updateStateOfProcessPerson, 
  updateResultPerson, 
  updateProfessionPerson, 
  updateIdTypePerson, 
  updateEducationLevelPerson, 
  updateLaboralActivityPerson, 
  updateIncomeRangePerson, 
  updateBirthdayPerson, 
  getPersonsInvestmentPlatform, 
  codeValidation, 
  testDirectRequest,
  loginPerson, 
  bringPerson, 
  updateContactChannelPerson, 
  updateManagementPersonPost, 
  updateNamePersonPost, 
  updateInversorStatePersonPost, 
  updateStateOfProcessPersonPost, 
  updateResultPersonPost, 
  updateIdTypePersonPost, 
  updateContactChannelPersonPost, 
  updateProfessionPersonPost, 
  updateEducationLevelPersonPost, 
  updateLaboralActivityPersonPost, 
  updateIncomeRangePersonPost, 
  updateBirthdayPersonPost,
  updateCountryPerson, 
  updateCountryPersonPost 
} = require("../controllers/person.controller.js");



// Person routes
router.get('/getNaturalPersonPostgres', getNaturalPersonPostgres);
router.post('/postNaturalPersonPostgres',postNaturalPersonPostgres);
router.put('/updateNaturalPerson', updateNaturalPerson);
router.post('/postLegalPerson', postLegalPerson)
router.put('/putLegalPerson', putLegalPerson)
router.post('/postRelationshipNaturalLegal', postRelationshipNaturalLegal)



// Old Router
router.post('/loginPerson', loginPerson);
router.post('/bringPerson', bringPerson);
router.post('/registerPerson', registerPerson);
router.post('/registerPersonBasicInfo', registerPersonBasicInfo);
router.post('/registerPersonPersonalData', registerPersonPersonalData);
router.post('/registerPersonDeclarations', registerPersonDeclarations);
router.post('/registerPersonAmlCheck', registerPersonAmlCheck);
router.post('/registerPersonIdentityVerification', registerPersonIdentityVerification);
router.post('/codeValidation', codeValidation);
router.post('/registerPersonUserValidation', registerPersonUserValidation);
router.post('/registerPersonInvestmentPlatformIntegration', registerPersonInvestmentPlatformIntegration);
router.get('/getPersons', getPersons);
router.get('/getPersonsInvestmentPlatform', getPersonsInvestmentPlatform);
router.get('/getCountries', getCountries);
router.put('/updateManagementPerson/:id', updateManagementPerson);
router.put('/updateManagementPersonPost/:id', updateManagementPersonPost);
router.put('/updateNamePerson/:id', updateNamePerson);
router.put('/updateNamePersonPost/:id', updateNamePersonPost);
router.put('/updateLastNamePerson/:id', updateLastNamePerson);
router.put('/updateLastNamePersonPost/:id', updateLastNamePersonPost);
router.put('/updatePhonePerson/:id', updatePhonePerson);
router.put('/updatePhonePersonPost/:id', updatePhonePersonPost);
router.put('/updateAddressPerson/:id', updateAddressPerson);
router.put('/updateAddressPersonPost/:id', updateAddressPersonPost);
router.put('/updateInversorProfilePerson/:id', updateInversorProfilePerson);
router.put('/updateInversorProfilePersonPost/:id', updateInversorProfilePersonPost);
router.put('/updateResponsibleExecutivePerson/:id', updateResponsibleExecutivePerson);
router.put('/updateResponsibleExecutivePersonPost/:id', updateResponsibleExecutivePersonPost);
router.put('/updateInversorStatePerson/:id', updateInversorStatePerson);
router.put('/updateInversorStatePersonPost/:id', updateInversorStatePersonPost);
router.put('/updateStateOfProcessPerson/:id', updateStateOfProcessPerson);
router.put('/updateStateOfProcessPersonPost/:id', updateStateOfProcessPersonPost);
router.put('/updateResultPerson/:id', updateResultPerson);
router.put('/updateResultPersonPost/:id', updateResultPersonPost);
router.put('/updateProfessionPerson/:id', updateProfessionPerson);
router.put('/updateProfessionPersonPost/:id', updateProfessionPersonPost);
router.put('/updateIdTypePerson/:id', updateIdTypePerson);
router.put('/updateIdTypePersonPost/:id', updateIdTypePersonPost);
router.put('/updateCountryPerson/:id', updateCountryPerson);
router.put('/updateCountryPersonPost/:id', updateCountryPersonPost);
router.put('/updateContactChannelPerson/:id', updateContactChannelPerson);
router.put('/updateContactChannelPersonPost/:id', updateContactChannelPersonPost);
router.put('/updateEducationLevelPerson/:id', updateEducationLevelPerson);
router.put('/updateEducationLevelPersonPost/:id', updateEducationLevelPersonPost);
router.put('/updateLaboralActivityPerson/:id', updateLaboralActivityPerson);
router.put('/updateLaboralActivityPersonPost/:id', updateLaboralActivityPersonPost);
router.put('/updateIncomeRangePerson/:id', updateIncomeRangePerson);
router.put('/updateIncomeRangePersonPost/:id', updateIncomeRangePersonPost);
router.put('/updateBirthdayPerson/:id', updateBirthdayPerson);
router.put('/updateBirthdayPersonPost/:id', updateBirthdayPersonPost);
router.get('/testDirectRequest', testDirectRequest);


//Test function for upload Excel files
router.post("/upload-excel", upload.single("excelFile"), async (req, res) => {
  try {

    console.log("ENTRO A LA CARGA MASIVA DE ARCHIVO");

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const excelData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    const columns = excelData[0];
    const data = excelData.slice(1);

    // Store data in PostgreSQL using Prisma
    for (const rowData of data) {
      const cargaExcel = await prisma.cargaExcel.create({
        data: {

          origen: rowData[0],
          dni: rowData[1],
          name: rowData[2],
          lastname: rowData[3],
          email: rowData[4],
          phone: rowData[5].toString(),
          registrationDate: new Date(rowData[6]),
          investmentamount: parseInt(rowData[7]),
          inversorprofile: rowData[8],
          idCountry: rowData[9],
          coin: rowData[10],
          responsibleexecutive: rowData[11],
          management: rowData[12],
          inversorstate: rowData[13],
          stateofprocess: rowData[14],
          result: rowData[15],
          idContactChannel: rowData[16],
        },
      });
    }

    res.json({ success: true, data, columns });
  } catch (error) {
    console.error("Error processing Excel file:", error);
    res.status(500).json({ success: false, error: "Error processing Excel file" });
  }
});

async function conectar() {
  try {
    await mongoose.connect(process.env.URI_MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Configuración de GridFS en Mongoose
    const conn = mongoose.connection;
    let gfs;
    conn.once('open', () => {
      gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads' // Nombre del bucket para almacenar los archivos
      });
    });

    console.log("Conexión OK");
  } catch (error) {
    console.log("Error de conexión a mongodb:" + error);
  }
}

conectar();
  // Configuración de GridFS en Mongoose
  const conn = mongoose.connection;
  let gfs;
  conn.once('open', () => {
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: 'uploads' // Nombre del bucket para almacenar los archivos
    });
  });

module.exports = router;
