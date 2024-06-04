const express = require('express');
const router = express.Router();


// Imports of email sending controllers
const {
    sendPasswordUpdateLink,
    getVerifyToken,
    postResendMail
} = require('../controllers/mail.controller.js');


// Email routes
router.post('/sendPasswordUpdateLink', sendPasswordUpdateLink);
router.get('/getVerifyToken', getVerifyToken);
router.post('/postResendMail', postResendMail);


module.exports = router;