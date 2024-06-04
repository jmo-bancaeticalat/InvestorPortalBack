const express = require('express');
const router = express.Router();

// User imports
const {
    getUserPostgres,
    postUserPostgres,
    postLoginUserPostgres,
    putUpdatePassword,
} = require('../controllers/user.controller.js')

// Routes for User
router.get('/getUserPostgres', getUserPostgres);
router.post('/postUserPostgres', postUserPostgres);
router.post('/postLoginUserPostgres', postLoginUserPostgres);
router.put('/putUpdatePassword', putUpdatePassword);

module.exports = router;
