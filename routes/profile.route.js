const express = require('express');
const router = express.Router();


// Imports of profile controllers
const {
    getProfilesPostgres
} = require('../controllers/profile.controller');


// Routes for user profiles
router.get('/getProfilesPostgres', getProfilesPostgres);


module.exports = router;
