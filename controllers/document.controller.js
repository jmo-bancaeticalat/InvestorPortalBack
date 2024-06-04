const multer = require('multer');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const {
  validateNumeric,
  validateAlphabetic,
} = require('../utils/validation')


// Function to delete a file
const deleteFile = (filePath) => {
    fs.unlinkSync(filePath);
};

//* Defining multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'documents_images/')
    },
    filename: function (req, file, cb) {
      const uploadDir = 'documents_images/';
      let fileName = file.originalname;

      // Check if the file already exists
      fs.access(uploadDir + fileName, (err) => {
        if (!err) {

          // If the file already exists, append a number to the file name
          let fileNumber = 1;
          let newFileName;
  
          // Iterate until finding a unique file name
          while (!err) {
            newFileName = fileName.split('.').slice(0, -1).join('.') + `_${fileNumber}.${fileName.split('.').pop()}`;
            fileNumber++;
            try {
              fs.accessSync(uploadDir + newFileName);
            } catch (error) {

              // If no error occurs, it means the file does not exist, so break the loop
              break;
            }
          }
  
          cb(null, newFileName);
        } else {
          // If the file does not exist, simply use the original name
          cb(null, fileName);
        }
      });
    }
});

// Setting up file upload with multer
const upload = multer({ storage: storage });

//* Saves document files in the system. Creates a new entry in the documents table with the file information. Returns the created document in the DB in JSON format.
const postDocuments = async (req, res) =>{
  try {

    // Check if a file is received
    if (!req.file) {
        return res.status(400).json({ error: 'No file received' });
    }

    // Extract relevant file information
    const { filename, path } = req.file;
    const { id_investment_account_natural, description, id_document_type  } = req.body;



    // Check if a valid id_investment_account_natural is provided
    if(!id_investment_account_natural){
      deleteFile(path); // Delete the file if validation fails
      return res.status(400).json({ error: 'No investment account natural ID received' });
    }

    // Check if the ID of the investment account is valid
    if (!validateNumeric(id_investment_account_natural)) {
      deleteFile(path); // Delete the file if validation fails
      return res.status(400).json({ error: 'Invalid account ID format' });
    }

    // Check if a valid id_document_type is provided
    if (!id_document_type) {
      deleteFile(path); // Delete the file if validation fails
      return res.status(400).json({ error: 'Document type ID missing' });
    }

    // Check if the ID of the id_document_type is valid
    if (!validateNumeric(id_document_type)) {
      deleteFile(path); // Delete the file if validation fails
      return res.status(400).json({ error: 'Invalid document type ID' });
    }

    // Check if the description format is valid
    if (!validateAlphabetic(description)) {
      deleteFile(path); // Delete the file if validation fails
      return res.status(400).json({ error: 'Invalid description format' });
    }

    const existingDocumentType = await prisma.document_Type.findFirst({
      where: {
        id_document_type: parseInt(id_document_type)
      },
    })

    if (!existingDocumentType) {
      deleteFile(path); // Delete the file if validation fails
      return res.status(400).json({ error: 'Invalid document type ID' });
    }

    // Check if the Investment account  exists in the data base
    const existingInvestmentAccount = await prisma.investment_Account_Natural.findFirst({
      where: {
        id_investment_account_natural: parseInt(id_investment_account_natural),
      },
    });

    // Return an error if the legal person does not exist
    if (!existingInvestmentAccount) {
      deleteFile(path); // Delete the file if validation fails
      return res.status(404).json({ error: "The investment account natural does not exist" });
    }  

    // Check if the file format is valid
    const validFormats = ['.png', '.pdf', '.jpg'];
    const fileExtension = '.' + filename.split('.').pop();
    
    if (!validFormats.includes(fileExtension)) {
      deleteFile(path); // Delete the file if validation fails
      return res.status(415).json({ error: 'Invalid file format, must be .png, .jpg, or .pdf' });
    }


    // Create a new entry in the Images_Documents table
    const newDocument = await prisma.images_Documents.create({
        data: {
            id_investment_account_natural: parseInt(id_investment_account_natural),
            img_link: path,
            img_name: filename,
            img_description: description || "",
            id_document_type: parseInt(id_document_type)
          }
    });

    res.status(201).json(newDocument)
   
  } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Server error' });
  }
}

//* Retrieves a specific document by its ID. Returns the found document in JSON format.
const getDocumentByIdAccount = async (req, res) => {

  try {

    // Extract account ID from request query
    const { id_investment_account_natural } = req.query;

    if(!id_investment_account_natural) {
      return res.status(400).json({ error: 'Missing account ID'})
    }

    if(!validateNumeric(id_investment_account_natural)){
      return res.status(400).json({ error: 'Invalid account ID fotmat'})
    }

    // Search for the document by ID account
    const existingDocuments = await prisma.images_Documents.findMany({
      where: {
        id_investment_account_natural: parseInt(id_investment_account_natural)
      }
    });

    // If no document is found with that ID, return it as an error
    if (existingDocuments.length === 0) {
      return res.status(404).json({ message: "No documents found for the investment account" });
    }

    return res.status(200).json(existingDocuments);

  } catch (error) {
    console.error("Error searching for the document", error);
    return res.status(500).json({ message: "Server Error" });
  }
}

//! Falta hacer la prueba de solicitud
//* Updates an existing document in the system. Returns the updated document in JSON format.
const putDocument = async (req, res) => {

  const {id_images_documents} = req.body;

  try {

    console.log(id_images_documents);


    // Check if the image id is correct
    const existingDocument = await prisma.images_Documents.findUnique({
      where: {
        id_images_documents: id_images_documents,
      },
    });

    // Validation if the document to be updated exists
    if(!existingDocument){
      return res.status(404).json({message:"This record does not exist"});
    }

    // Check if a file was received to update
    if (!req.file) {
      return res.status(400).json({ error: 'No file received for updating' });
    }

    // Update the document in the database
    const updatedDocument = await prisma.images_Documents.update({
      where: {
        id_images_documents: id_images_documents,
      },
      data: {
        img_link: path,
        img_name: filename,
      },
    });

    res.json(updatedDocument);

    console.log('Document updated successfully!');


  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
    storage,
    upload,
    postDocuments,
    getDocumentByIdAccount,
    putDocument
};
