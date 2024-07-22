const express = require('express');
const router = express.Router();

const {
    createUserandNaturalPerson
} = require('../controllers/synchronousFunctions.controler.js')

router.post('/createUserandNaturalPerson', createUserandNaturalPerson);

module.exports = router;