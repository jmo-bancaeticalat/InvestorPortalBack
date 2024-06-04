const express = require('express');
const router = express.Router();

 // Importaciónes de los controladores de Risk Profile
 const {
    getRiskProfileQuestions,
    getAnswersRiskQuestions,
    getRiskProfileQuestionSelection,
    getRiskProfile,
    getScales,
    postRiskProfileForAccount,
    postRiskProfileQuestionSelection,
    UpdateRiskProfileScale,
} = require('../controllers/riskProfile.controller.js');

// Rutas de Risk Profile
router.get('/getRiskProfileQuestions', getRiskProfileQuestions);
router.get('/getAnswersRiskQuestions', getAnswersRiskQuestions);
router.get('/getRiskProfileQuestionSelection', getRiskProfileQuestionSelection)
router.get('/getRiskProfile', getRiskProfile);
router.get('/getScales', getScales);
router.post('/postRiskProfileForAccount', postRiskProfileForAccount);
router.post('/postRiskProfileQuestionSelection', postRiskProfileQuestionSelection);
router.put('/UpdateRiskProfileScale', UpdateRiskProfileScale);


module.exports = router;