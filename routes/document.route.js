const express = require('express');
const router = express.Router();
const multer = require('multer');


// Imports of document controllers
const { 
    storage,
    upload,
    postDocuments,
    getDocumentByIdAccount,
    putDocument
} = require('../controllers/document.controller.js')


// Routes for uploading documents
router.post('/postDocuments', upload.single('file') ,postDocuments);
router.get('/getDocumentByIDaccount', getDocumentByIdAccount);
router.put('/putDocument', putDocument);


module.exports = router;