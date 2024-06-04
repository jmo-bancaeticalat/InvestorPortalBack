const express = require('express');
const router = express.Router();


// Auxiliary tables import
const {
    getIncomeRanges,
    getOccupations,
    getEducationalLevel,
    getCountriesPostgres, 
} = require('../controllers/auxiliar.controller.js')


// Rutas de las tablas auxiliares
router.get('/getIncomeRanges', getIncomeRanges);
router.get('/getOccupations', getOccupations);
router.get('/getEducationalLevel', getEducationalLevel);
router.get('/getCountriesPostgres', getCountriesPostgres);


module.exports = router;