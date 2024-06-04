const express = require('express');
const { infoUser, login, register } = require('../controllers/auth.controller.js');
const { requireToken } = require('../middlewares/requireToken.js');

const router = express.Router();

router.post('/login', login);

router.post('/register', register);

router.get('/protected', requireToken, infoUser);

module.exports = router;
