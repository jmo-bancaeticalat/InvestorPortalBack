const express = require('express');
const router = express.Router();

// Account imports 
const {
    getInvestmentAccountNaturalPostgres,
    postInvestmentAccountNatural,
    postInvestmentAccountLegal,
    getInvestmentAccountLegal,
    putQualifiedInvestor,
    putIfAML,
    putIfPEP,
    postTaxResidency,
    getTaxResidency,
    postPEP,
} = require('../controllers/account.controller.js')


// Investment account routes
router.get('/getTaxResidency', getTaxResidency);
router.post('/postTaxResidency', postTaxResidency);
router.post('/postPEP', postPEP)
router.put('/putIfPEP', putIfPEP);
router.put('/putIfAML', putIfAML);
router.put('/putQualifiedInvestor', putQualifiedInvestor);
router.get('/getInvestmentAccountLegal', getInvestmentAccountLegal)
router.post('/postInvestmentAccountLegal', postInvestmentAccountLegal)
router.post('/postInvestmentAccountNatural', postInvestmentAccountNatural);
router.get('/getInvestmentAccountNaturalPostgres', getInvestmentAccountNaturalPostgres);

module.exports = router;