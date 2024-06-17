// Infraestructura
const axios = require("axios");
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
// Models
const { Person } = require('../models/Person.js');
const { Country } = require('../models/Country.js');

const { sendMailUniquePortal, generateToken } = require('../controllers/mail.controller.js');
const { assign } = require("nodemailer/lib/shared/index.js");

// Variables principales
const prisma = new PrismaClient();

const {
  validateNumeric,
  validateDate,
  validateBoolean,
  validatePhone,
  validateAlphabetic,
} = require('../utils/validation')

//todo: Crear endpoint para actualizar el carnet.
//todo: Crear endpoint para actualizar los datos personales.
//todo: Crear endopoint que reciba el usuario y mostrar los intrumentos disponibles habilitados para el pais del usuario.

//* ---------------- PERSONS CONTROLLERS ----------------------- *\\

// Deleting relationship for testing
const testDeletRelationship = async () => {
  await prisma.relationship_Natural_Legal.deleteMany({
    where: {
      id_natural_person: 1,
      id_legal_person: 1,
    },
  });
}

// Deleting legal person for testing
const testDeletLegalPerson = async () => {
  await prisma.legal_Person.deleteMany({
    where: {
      company_creation_date: '2024-01-01T00:00:00.000Z'
    },
  });
}

// Creates a relationship between a natural person and a legal entity in the database.
const postRelationshipNaturalLegal = async (req, res) => {
  const { id_natural_person, id_legal_person } = req.body;

  try {

    // Check if the ID of the natural person was sent
    if (!id_natural_person) {
      return res.status(400).json({ error: 'The ID of the natural person is missing' });
    }

    // Check if the ID of the legal person was sent
    if (!id_legal_person) {
      return res.status(400).json({ error: 'The ID of the legal person is missing' });
    }

    // Check the format of the natural person ID is only numbers
    if (!validateNumeric(id_natural_person)){
      return res.status(400).json({ error: 'The ID of the natural person is not valid' });
    }

      // Check the format of the legal person ID is only numbers
    if (!validateNumeric(id_legal_person)){
      return res.status(400).json({ error: 'The ID of the legal person is not valid' });
    }

    // Search the ID of the natural person in the database
    const existingNaturalPerson = await prisma.natural_Person.findUnique({
      where: {
        id_natural_person: parseInt(id_natural_person),
      },
    })

    // If the natural person does not exist, it throws an error
    if (!existingNaturalPerson) {
      return res.status(404).json({ error: 'The natural person does not exist' });
    }

    // Search the ID of the legal person in the database
    const existingLegalPerson = await prisma.legal_Person.findUnique({
      where: {
        id_legal_person: parseInt(id_legal_person),
      },
    })

    // If the legal person does not exist, it throws an error
    if (!existingLegalPerson) {
      return res.status(404).json({ error: 'The legal person does not exist' });
    }

    // Check if the relationship already exists in the database
    const existingRelationship = await prisma.relationship_Natural_Legal.findFirst({
      where: {
        id_natural_person: parseInt(id_natural_person),
        id_legal_person: parseInt(id_legal_person),
      },
    });

    // If the relationship already exists, it throws an error
    if (existingRelationship) {
      return res.status(409).json({ error: 'The relationship between the natural person and the legal person already exists' });
    }

    // Create the relationship in the database
    const createRelationship = await prisma.relationship_Natural_Legal.create({
      data: {
        id_natural_person: id_natural_person,
        id_legal_person: id_legal_person
      }
    });

    return res.status(200).json({ ok: true, createRelationship });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};


// Updates the data of a legal entity in the database.
const putLegalPerson = async (req, res) => {
  try {
    const { id_legal_person, company_creation_date } = req.body;

    // Checks if the legal person ID is missing.
    if (!id_legal_person) {
      return res.status(400).json({ error: 'The legal person ID is missing' });
    }

    // Checks if the company creation date is missing.
    if (!company_creation_date) {
      return res.status(400).json({ error: 'The company creation date is missing' });
    }

    // Validates if the legal person ID has a numeric format.
    if (!validateNumeric(id_legal_person)) {
      return res.status(400).json({ error: 'The legal person ID has an invalid format'});
    }

    // Validates if the company creation date has a valid date format.
    if (!validateDate(company_creation_date)) {
      return res.status(400).json({ error: 'The company creation date has an invalid format'})
    }

    // Checks if the legal person exists in the database.
    const existingLegalPerson = await prisma.legal_Person.findUnique({
      where: {
        id_legal_person: id_legal_person,
      },
    });

    // If the legal person does not exist, returns a 404 error.
    if (!existingLegalPerson) {
      return res.status(404).json({ error: "The legal person does not exist" });
    }

    // Updates the legal person with the new company creation date.
    const updatedLegalPerson = await prisma.legal_Person.update({
      where: {
        id_legal_person: id_legal_person,
      },
      data: {
        company_creation_date: company_creation_date
      },
    });

    // Returns a success response with the updated legal person data.
    return res.status(200).json({ ok: true, updatedLegalPerson })

  } catch (error) {

    // Handle errors, print to console, and return a server error.
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
};


// Creates a new legal entity in the database.
const postLegalPerson = async (req, res) => {
  try {
    const { company_creation_date } = req.body;

    // Checks if the company creation date is missing.
    if (!company_creation_date) {
      return res.status(400).json({ error: 'The company creation date is missing' });
    }

    // Validates if the company creation date has a valid date format.
    if (!validateDate(company_creation_date)) {
      return res.status(400).json({ error: 'The company creation date has an invalid format' });
    }

    // Creates a new legal person in the database with the provided company creation date.
    const createLegalPerson = await prisma.legal_Person.create({
      data: {
        company_creation_date: company_creation_date, 
      },
    });

    // Returns a success response with the newly created legal person data.
    return res.status(200).json({ ok: true, createLegalPerson });

  } catch (error) {

    // Logs the error and returns a 500 server error response.
    console.log(error);
    return res.status(500).json({ error: 'Server error' });
  }
};


// Updates the data of a natural person in the database.
const updateNaturalPerson = async (req, res) => {
  try {

    // Extract data from request body
    const { 
      id_natural_person,
      cell_phone,
      birthday,
      usa_citizen,
      id_country_residence,
      id_country_nationality,
      id_gender,
      id_civil_status 
    } = req.body;

    // Check if natural person ID is provided
    if (!id_natural_person){
      return res.status(400).json({ error: 'The natural person id is missing' });
    }

    // Validate format of natural person ID
    if (!validateNumeric(id_natural_person)) {
      return res.status(400).json({ error: 'The ID of the natural person has an invalid format'})
    }

    // Check if any data apart from id_natural_person is provided
    if (
      !cell_phone &&
      !birthday &&
      !usa_citizen &&
      !id_country_residence &&
      !id_country_nationality &&
      !id_gender &&
      !id_civil_status
    ) {
      return res.status(400).json({ error: 'At least one field must be provided for the update of the natural person.' });
    }

    // Validate format of cell phone number
    if (!validatePhone(cell_phone)) {
      return res.status(400).json({ error: 'The cell phone has an invalid format' })
    }

    // Validate format of birthday
    if (!validateDate(birthday)) {
      return res.status(400).json({ error: 'The birthday has an invalid format' })
    }

    // Validate format of USA citizen boolean
    if (!validateBoolean(usa_citizen)) {
      return res.status(400).json({ error: 'The USA citizen has an invalid format' })
    }

    // Validate format of country of residence ID
    if (!validateNumeric(id_country_residence)) {
      return res.status(400).json({ error: 'The ID of the country of residence has an invalid format' })
    }

    // Validate format of country of nationality ID
    if (!validateNumeric(id_country_nationality)) {
      return res.status(400).json({ error: 'The ID of the country of nationality has an invalid format' })
    }

    // Validate format of gender ID
    if (!validateNumeric(id_gender)) {
      return res.status(400).json({ error: 'The ID of the gender has an invalid format' }) 
    }

    // Validate format of civil status ID
    if (!validateNumeric(id_civil_status)) {
      return res.status(400).json({ error: 'The ID of the civil status has an invalid format' })
    }

    // Check if the natural person exists
    const existingNaturalPerson = await prisma.natural_Person.findUnique({
      where: {
        id_natural_person: parseInt(id_natural_person),
      },
    });

    // If the natural person does not exist, it throws an error
    if (!existingNaturalPerson) {
      return res.status(404).json({ error: "The natural person does not exist" });
    }

    // If everything is fine, update the natural person
    const updatedNaturalPerson = await prisma.natural_Person.update({
      where: {
        id_natural_person: existingNaturalPerson.id_natural_person,
      },
      data: {
        cell_phone,
        birthday,
        usa_citizen,
        id_country_residence,
        id_country_nationality,
        id_gender,
        id_civil_status
      },
    });

    // If everything is fine, update the natural person
    return res.status(200).json({ message: "Natural person correctly updated", updatedNaturalPerson });

  } catch (error) {

    // Handle errors, print to console, and return a server error.
    console.error("Error updating Natural Person record", error);
    return res.status(500).json({ error: "Server error." });
  }
};

// Gets a natural persons from the PostgreSQL database.
const getNaturalPersonPostgres = async (req, res) => {
  try {
    const { id_natural_person } = req.query;

    // Check if natural person ID is provided
    if (!id_natural_person){
      return res.status(400).json({ error: 'The ID of the natural person is missing' })
    }

    // Validate format of natural person ID
    if (!validateNumeric(id_natural_person)) {
      return res.status(400).json({ error: 'The ID of the natural person has an invalid format' })
    }

    // Check if the natural person exists
    const existingNaturalPerson = await prisma.natural_Person.findUnique({
      where: {
        id_natural_person: parseInt(id_natural_person)
      }
    });

    // If the natural person does not exist, it throws an error
    if (!existingNaturalPerson) {
      return res.status(404).json({ error: 'The natural person does not exist' })
    }

    // If everything is fine, get the natural person
    res.status(200).json(existingNaturalPerson);

  } catch (error) {

    // Handle errors, print to console, and return a server error.
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};


// Creates a new natural person in the PostgreSQL database. 
const postNaturalPersonPostgres = async (req, res) => {
  try {

    // Default ID for relationships that are not provided.
    const defaultId = 0;

    // Extracts fields from the request body.
    const { 
      name,
      lastname,
      id_user,
    } = req.body;

    // Checks if the name of the natural person is provided.
    if (!name) {
      return res.status(400).json({ error: 'The name of the natural person is missing'})
    }

    // Checks if the lastname of the natural person is provided.
    if (!lastname) {
      return res.status(400).json({ error: 'The lastname of the natural person is missing'})
    }

    // Checks if the user ID is provided.
    if (!id_user) {
      return res.status(400).json({ error: 'The ID of the user is missing'})
    }

    // Validates the format of the name.
    if (!validateAlphabetic(name)) {
      return res.status(400).json({ error: 'The name of the natural person has an invalid format' })
    }

    // Validates the format of the lastname.
    if (!validateAlphabetic(lastname)) {
      return res.status(400).json({ error: 'The lastname of the natural person has an invalid format' })
    }

    // Validates the format of the user ID.
    if (!validateNumeric(id_user)) {
      return res.status(400).json({ error: 'The ID of the user has an invalid format' })
    }

    // Checks if the user exists in the database.
    const existingUser = await prisma.user.findUnique({
      where: {
        id_user: parseInt(id_user)
      }
    })

    // If the user does not exist, returns a 404 error.
    if (!existingUser) {
      return res.status(404).json({ error: 'The user does not exist' })
    }

    // Checks if the user already has an assigned natural person.
    const existingNaturalPerson = await prisma.natural_Person.findFirst ({
      where: {
        id_user: parseInt(id_user)
      }
    });

    // If the user already has a natural person, returns a 400 error.
    if (existingNaturalPerson) {
      return res.status(400).json({ error: 'The user already has an assigned natural person' });
    }


    // Creates a new natural person in the database.
    const createdNaturalPerson = await prisma.natural_Person.create({
      data: {
        name,
        lastname,
        user: {
          connect: { id_user: id_user }
        },
        country_residence: {
          connect: { id_country: defaultId },
        },
        country_nationality: {
          connect: { id_country: defaultId },
        },
        gender: {
          connect: { id_gender: defaultId },
        },
        civil_status: {
          connect: { id_civil_status: defaultId },
        }
      }
    });

    // Returns a success response with the created natural person data.
    res.status(201).json(createdNaturalPerson);

  } catch (error) {
    // Handle errors, print to console, and return a server error.
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};


//* ---------------- END PERSONS CONTROLLERS ----------------------- *\\

//* ---------------- USER CONTROLLERS ----------------------- *\\

//PUT USERS
const putUser = async (req, res) => {

  const { id_user, email, username, password, state } = req.body;

  // Validar campos obligatorios
  if (!id_user) {
    return res.status(400).json({ error: "El campo id_user es obligatorio." });
  }

  try {

    const existingUser = await prisma.user.findFirst({
      where: {
        id_user: id_user,
      },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "El usuario no existe." });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id_user: existingUser.id_user,
      },
      data: {
        email: email || existingUser.email,
        username: username || existingUser.username,
        password: password || existingUser.password,
        state: state || existingUser.state,
      },
    });

    return res.json({ ok: true, updatedUser });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};


// GET USER
const getUser = async (req, res) => {
  try {
    const getUser = await prisma.user.findMany({
      select: { id_user: true, email: true, username: true, state: true }
    });
    console.log("Usuarios");
    res.json(getUser);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};


// POST USER
const postUser = async (req, res) => {

  const { email, username, password } = req.body;

  try {

    // Verificar si ya existe el usuario
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: "El email o el usuario ya están en uso." });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const createdUser = await prisma.user.create({
      data: {
        email: email,
        username: username,
        password: hashedPassword
      }
    });

    return res.json({ ok: true, createdUser });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error de servidor" });
  }
};


//* ---------------- END USER CONTROLLERS ----------------------- *\\



// NUEVO
 const updateNamePersonPostgres= async(req,res) => {

  let { id } = req.params;
  const { name } = req.body;

  id=parseInt(id);

  try {
      const updatedPerson = await prisma.person.update({
          where: { id: id },
          data: { name: name },
        });

        return res.status(200).json({ message: "Campo 'name' actualizado correctamente.", updatedPerson });
  } catch (error) {
      console.error("Error al actualizar el campo 'management':", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
}

const updateLastNamePerson= async(req,res) => {

    const { id } = req.params;
    const { lastname } = req.body;

    try {
        const person = await Person.findByIdAndUpdate(
            id,
            { lastname },
            { new: true }
          );

          if (!person) {
            return res.status(404).json({ error: "Persona no encontrada." });
          }

          return res.status(200).json({ message: "Campo 'lastname' actualizado correctamente.", person });
    } catch (error) {
        console.error("Error al actualizar el campo 'lastname':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateLastNamePersonPost= async(req,res) => {

    let { id } = req.params;
    const { lastname } = req.body;

    id=parseInt(id);

    try {
        const updatedPerson = await prisma.cargaexcel.update({
            where: { id: id },
            data: { lastname: lastname },
          });

          return res.status(200).json({ message: "Campo 'lastname' actualizado correctamente.", updatedPerson });
    } catch (error) {
        console.error("Error al actualizar el campo 'management':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updatePhonePerson= async(req,res) => {

    const { id } = req.params;
    const { phone } = req.body;

    try {
        const person = await Person.findByIdAndUpdate(
            id,
            { phone },
            { new: true }
          );

          if (!person) {
            return res.status(404).json({ error: "Persona no encontrada." });
          }

          return res.status(200).json({ message: "Campo 'phone' actualizado correctamente.", person });
    } catch (error) {
        console.error("Error al actualizar el campo 'phone':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updatePhonePersonPost= async(req,res) => {

    let { id } = req.params;
    const { phone } = req.body;

    id=parseInt(id);

    try {
        const updatedPerson = await prisma.cargaexcel.update({
            where: { id: id },
            data: { phone: phone },
          });

          return res.status(200).json({ message: "Campo 'lastname' actualizado correctamente.", updatedPerson });
    } catch (error) {
        console.error("Error al actualizar el campo 'management':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateAddressPerson= async(req,res) => {

    const { id } = req.params;
    const { address } = req.body;

    try {
        const person = await Person.findByIdAndUpdate(
            id,
            { address },
            { new: true }
          );

          if (!person) {
            return res.status(404).json({ error: "Persona no encontrada." });
          }

          return res.status(200).json({ message: "Campo 'address' actualizado correctamente.", person });
    } catch (error) {
        console.error("Error al actualizar el campo 'address':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateAddressPersonPost= async(req,res) => {

    let { id } = req.params;
    const { address } = req.body;

    id=parseInt(id);

    try {
        const updatedPerson = await prisma.cargaexcel.update({
            where: { id: id },
            data: { address: address },
          });

          return res.status(200).json({ message: "Campo 'lastname' actualizado correctamente.", updatedPerson });
    } catch (error) {
        console.error("Error al actualizar el campo 'management':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateInversorProfilePerson= async(req,res) => {

    const { id } = req.params;
    const { inversorprofile } = req.body;

    try {
        const person = await Person.findByIdAndUpdate(
            id,
            { inversorprofile },
            { new: true }
          );

          if (!person) {
            return res.status(404).json({ error: "Persona no encontrada." });
          }

          return res.status(200).json({ message: "Campo 'inversorProfile' actualizado correctamente.", person });
    } catch (error) {
        console.error("Error al actualizar el campo 'inversorProfile':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateInversorProfilePersonPost= async(req,res) => {

    let { id } = req.params;
    const { inversorprofile } = req.body;

    id=parseInt(id);

    try {
        const updatedPerson = await prisma.cargaexcel.update({
            where: { id: id },
            data: { inversorprofile: inversorprofile },
          });

          return res.status(200).json({ message: "Campo 'lastname' actualizado correctamente.", updatedPerson });
    } catch (error) {
        console.error("Error al actualizar el campo 'management':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateResponsibleExecutivePerson= async(req,res) => {

    const { id } = req.params;
    const { responsibleexecutive } = req.body;

    try {
        const person = await Person.findByIdAndUpdate(
            id,
            { responsibleexecutive },
            { new: true }
          );

          if (!person) {
            return res.status(404).json({ error: "Persona no encontrada." });
          }

          return res.status(200).json({ message: "Campo 'responsibleexecutive' actualizado correctamente.", person });
    } catch (error) {
        console.error("Error al actualizar el campo 'responsibleexecutive':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateResponsibleExecutivePersonPost= async(req,res) => {

    let { id } = req.params;
    const { responsibleexecutive } = req.body;

    id=parseInt(id);

    try {
        const updatedPerson = await prisma.cargaexcel.update({
            where: { id: id },
            data: { responsibleexecutive: responsibleexecutive },
          });

          return res.status(200).json({ message: "Campo 'lastname' actualizado correctamente.", updatedPerson });
    } catch (error) {
        console.error("Error al actualizar el campo 'management':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}


 const updateInversorStatePerson= async(req,res) => {

    const { id } = req.params;
    const { inversorstate } = req.body;

    try {
        const person = await Person.findByIdAndUpdate(
            id,
            { inversorstate },
            { new: true }
          );

          if (!person) {
            return res.status(404).json({ error: "Persona no encontrada." });
          }

          return res.status(200).json({ message: "Campo 'inversorstate' actualizado correctamente.", person });
    } catch (error) {
        console.error("Error al actualizar el campo 'inversorstate':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateInversorStatePersonPost= async(req,res) => {

    let { id } = req.params;
    const { inversorstate } = req.body;

    id=parseInt(id);

    try {
        const updatedPerson = await prisma.cargaexcel.update({
            where: { id: id },
            data: { inversorstate: inversorstate },
          });

          return res.status(200).json({ message: "Campo 'inversorstate' actualizado correctamente.", updatedPerson });
    } catch (error) {
        console.error("Error al actualizar el campo 'management':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}
  
 const updateStateOfProcessPerson= async(req,res) => {

    const { id } = req.params;
    const { stateofprocess } = req.body;

    try {
        const person = await Person.findByIdAndUpdate(
            id,
            { stateofprocess },
            { new: true }
          );

          if (!person) {
            return res.status(404).json({ error: "Persona no encontrada." });
          }

          return res.status(200).json({ message: "Campo 'stateofprocess' actualizado correctamente.", person });
    } catch (error) {
        console.error("Error al actualizar el campo 'stateofprocess':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateStateOfProcessPersonPost= async(req,res) => {

    let { id } = req.params;
    const { stateofprocess } = req.body;

    id=parseInt(id);

    try {
        const updatedPerson = await prisma.cargaexcel.update({
            where: { id: id },
            data: { stateofprocess: stateofprocess },
          });

          return res.status(200).json({ message: "Campo 'stateofprocess' actualizado correctamente.", updatedPerson });
    } catch (error) {
        console.error("Error al actualizar el campo 'stateofprocess':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateResultPerson= async(req,res) => {

    const { id } = req.params;
    const { result } = req.body;

    try {
        const person = await Person.findByIdAndUpdate(
            id,
            { result },
            { new: true }
          );

          if (!person) {
            return res.status(404).json({ error: "Persona no encontrada." });
          }

          return res.status(200).json({ message: "Campo 'result' actualizado correctamente.", person });
    } catch (error) {
        console.error("Error al actualizar el campo 'result':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateResultPersonPost= async(req,res) => {

    let { id } = req.params;
    const { result } = req.body;

    id=parseInt(id);

    try {
        const updatedPerson = await prisma.cargaexcel.update({
            where: { id: id },
            data: { result: result },
          });

          return res.status(200).json({ message: "Campo 'result' actualizado correctamente.", updatedPerson });
    } catch (error) {
        console.error("Error al actualizar el campo 'result':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}


 const updateProfessionPerson= async(req,res) => {

    const { id } = req.params;
    const { professionoroccupation } = req.body;

    try {
        const person = await Person.findByIdAndUpdate(
            id,
            { professionoroccupation },
            { new: true }
          );

          if (!person) {
            return res.status(404).json({ error: "Persona no encontrada." });
          }

          return res.status(200).json({ message: "Campo 'professionOrOccupation' actualizado correctamente.", person });
    } catch (error) {
        console.error("Error al actualizar el campo 'professionOrOccupation':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateProfessionPersonPost= async(req,res) => {

    let { id } = req.params;
    const { professionoroccupation } = req.body;

    id=parseInt(id);

    try {
        const updatedPerson = await prisma.cargaexcel.update({
            where: { id: id },
            data: { professionoroccupation: professionoroccupation },
          });

          return res.status(200).json({ message: "Campo 'professionoroccupation' actualizado correctamente.", updatedPerson });
    } catch (error) {
        console.error("Error al actualizar el campo 'professionoroccupation':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateIdTypePerson= async(req,res) => {

    const { id } = req.params;
    const { idTypePerson } = req.body;

    try {
        const person = await Person.findByIdAndUpdate(
            id,
            { idTypePerson },
            { new: true }
          );

          if (!person) {
            return res.status(404).json({ error: "Persona no encontrada." });
          }

          return res.status(200).json({ message: "Campo 'idTypePerson' actualizado correctamente.", person });
    } catch (error) {
        console.error("Error al actualizar el campo 'idTypePerson':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateIdTypePersonPost= async(req,res) => {

    let { id } = req.params;
    const { idTypePerson } = req.body;

    id=parseInt(id);

    try {
        const updatedPerson = await prisma.cargaexcel.update({
            where: { id: id },
            data: { idTypePerson: idTypePerson },
          });

          return res.status(200).json({ message: "Campo 'idTypePerson' actualizado correctamente.", updatedPerson });
    } catch (error) {
        console.error("Error al actualizar el campo 'idTypePerson':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateCountryPerson= async(req,res) => {

    const { id } = req.params;
    const { idCountry } = req.body;

    try {
        const person = await Person.findByIdAndUpdate(
            id,
            { idCountry },
            { new: true }
          );

          if (!person) {
            return res.status(404).json({ error: "Persona no encontrada." });
          }

          return res.status(200).json({ message: "Campo 'idCountry' actualizado correctamente.", person });
    } catch (error) {
        console.error("Error al actualizar el campo 'idCountry':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateCountryPersonPost= async(req,res) => {

    let { id } = req.params;
    const { idCountry } = req.body;

    id=parseInt(id);

    try {
        const updatedPerson = await prisma.cargaexcel.update({
            where: { id: id },
            data: { idCountry: idCountry },
          });

          return res.status(200).json({ message: "Campo 'idCountry' actualizado correctamente.", updatedPerson });
    } catch (error) {
        console.error("Error al actualizar el campo 'idCountry':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateContactChannelPerson= async(req,res) => {

    const { id } = req.params;
    const { idContactChannel } = req.body;

    try {
        const person = await Person.findByIdAndUpdate(
            id,
            { idContactChannel },
            { new: true }
          );

          if (!person) {
            return res.status(404).json({ error: "Persona no encontrada." });
          }

          return res.status(200).json({ message: "Campo 'idContactChannel' actualizado correctamente.", person });
    } catch (error) {
        console.error("Error al actualizar el campo 'idContactChannel':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateContactChannelPersonPost= async(req,res) => {

    let { id } = req.params;
    const { idContactChannel } = req.body;

    id=parseInt(id);

    try {
        const updatedPerson = await prisma.cargaexcel.update({
            where: { id: id },
            data: { idContactChannel: idContactChannel },
          });

          return res.status(200).json({ message: "Campo 'idContactChannel' actualizado correctamente.", updatedPerson });
    } catch (error) {
        console.error("Error al actualizar el campo 'idContactChannel':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateEducationLevelPerson= async(req,res) => {

    const { id } = req.params;
    const { idEducationLevel } = req.body;

    try {
        const person = await Person.findByIdAndUpdate(
            id,
            { idEducationLevel },
            { new: true }
          );

          if (!person) {
            return res.status(404).json({ error: "Persona no encontrada." });
          }

          return res.status(200).json({ message: "Campo 'idEducationLevel' actualizado correctamente.", person });
    } catch (error) {
        console.error("Error al actualizar el campo 'idEducationLevel':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateEducationLevelPersonPost= async(req,res) => {

    let { id } = req.params;
    const { idEducationLevel } = req.body;

    id=parseInt(id);

    try {
        const updatedPerson = await prisma.cargaexcel.update({
            where: { id: id },
            data: { idEducationLevel: idEducationLevel },
          });

          return res.status(200).json({ message: "Campo 'idEducationLevel' actualizado correctamente.", updatedPerson });
    } catch (error) {
        console.error("Error al actualizar el campo 'idEducationLevel':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateLaboralActivityPerson= async(req,res) => {

    const { id } = req.params;
    const { idLaboralActivity } = req.body;

    try {
        const person = await Person.findByIdAndUpdate(
            id,
            { idLaboralActivity },
            { new: true }
          );

          if (!person) {
            return res.status(404).json({ error: "Persona no encontrada." });
          }

          return res.status(200).json({ message: "Campo 'idLaboralActivity' actualizado correctamente.", person });
    } catch (error) {
        console.error("Error al actualizar el campo 'idLaboralActivity':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateLaboralActivityPersonPost= async(req,res) => {

    let { id } = req.params;
    const { idLaboralActivity } = req.body;

    id=parseInt(id);

    try {
        const updatedPerson = await prisma.cargaexcel.update({
            where: { id: id },
            data: { idLaboralActivity: idLaboralActivity },
          });

          return res.status(200).json({ message: "Campo 'idLaboralActivity' actualizado correctamente.", updatedPerson });
    } catch (error) {
        console.error("Error al actualizar el campo 'idLaboralActivity':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateIncomeRangePerson= async(req,res) => {

    const { id } = req.params;
    const { idIncomeRange } = req.body;

    try {
        const person = await Person.findByIdAndUpdate(
            id,
            { idIncomeRange },
            { new: true }
          );

          if (!person) {
            return res.status(404).json({ error: "Persona no encontrada." });
          }

          return res.status(200).json({ message: "Campo 'idIncomeRange' actualizado correctamente.", person });
    } catch (error) {
        console.error("Error al actualizar el campo 'idIncomeRange':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateIncomeRangePersonPost= async(req,res) => {

    let { id } = req.params;
    const { idIncomeRange } = req.body;

    id=parseInt(id);

    try {
        const updatedPerson = await prisma.cargaexcel.update({
            where: { id: id },
            data: { idIncomeRange: idIncomeRange },
          });

          return res.status(200).json({ message: "Campo 'idIncomeRange' actualizado correctamente.", updatedPerson });
    } catch (error) {
        console.error("Error al actualizar el campo 'idIncomeRange':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateBirthdayPerson= async(req,res) => {

    const { id } = req.params;
    const { birthday } = req.body;
    
    

    try {
        const person = await Person.findByIdAndUpdate(
            id,
            { birthday },
            { new: true }
          );

          if (!person) {
            return res.status(404).json({ error: "Persona no encontrada." });
          }

          return res.status(200).json({ message: "Campo 'birthday' actualizado correctamente.", person });
    } catch (error) {
        console.error("Error al actualizar el campo 'birthday':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

const updateBirthdayPersonPost= async(req,res) => {

    let { id } = req.params;
    let { birthday } = req.body;

    console.log(birthday);

    id=parseInt(id);
    // Parsear la fecha con el formato "DD/MM/YYYY" a objeto Date
    birthday=birthday.toString();
    const parsedBirthday = new Date(birthday.split('/').reverse().join('-'));

    try {
        const updatedPerson = await prisma.cargaexcel.update({
            where: { id: id },
            data: { birthday: parsedBirthday },
          });

          return res.status(200).json({ message: "Campo 'birthday' actualizado correctamente.", updatedPerson });
    } catch (error) {
        console.error("Error al actualizar el campo 'birthday':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

//Test methods

const testDirectRequest= async(req,res) => {

    const requestParams = {
        url: "https://chile.test.bancaeticalat.com/APP/AAA/Inversionista.json?type=data&sortBy&sortDesc=false&perPage=5&currentPage=1",
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/json",
        },
        query: {
            type: "data",
            sortBy: "",
            sortDesc: "false",
            perPage: "5",
            currentPage: "1"
        },
        type: "json" // Opcional, el valor por defecto es "json"
      };
    
    
      try {
        //const response = await directRequest(requestParams);
        console.log(response.body); // Aquí maneja la respuesta como necesites
      } catch (error) {
        console.error("Error:", error);
      }
}

//Old functions
// OLD FUNCTIONS --------------------------------------------------------------------------------------------

// Controlador para la autenticación y el inicio de sesión de usuarios
 const loginPerson = async (req, res) => {
  const { email, password } = req.body; // Obtener email y password del cuerpo de la solicitud
    try {
        let person =await Person.findOne({email}); // Buscar usuario por su email en la base de datos

        if (person) { // Si se encuentra el usuario en la base de datos
          if (password == person.password) { // Verificar si la contraseña coincide con la almacenada en la base de datos
            console.log("PASSWORD COINCIDE");
          } 
            //Aqui va el código de si existe el usuario 
            return res.json(person);  // Retornar los detalles del usuario como respuesta JSON
        }else{
            //Aqui va el retorno **
            // Retornar un mensaje de error si no se encuentra el usuario
            return res.status(400).json({error: "Usuario no existe"});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Error de servidor" }); // Retornar un mensaje de error en caso de error interno
    }
}

 const bringPerson= async(req,res) => {
    const {email}=req.body;
    try {
        let person =await Person.findOne({email});

        if(person){
            //Aqui va el código de si existe el usuario 
            return res.json(person);
        }else{
            //Aqui va el retorno **
            return res.status(400).json({error: "Usuario no existe"});

        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Error de servidor"});
    }
}

 const registerPerson= async(req,res) => {
    const {idCountry, name, lastname, email, phone, idContactChannel, termsCondition ,legalPerson}=req.body;

    try {

       /*  const auth = await getAccessToken() || await generateNewToken();
  if (!auth) return;

  const subject = '¡Hola desde la automatización de correo!';
  const body = 'Este es un correo enviado automáticamente desde Node.js.';
  const recipient = 'destinatario@gmail.com';

  await sendEmail(auth, subject, body, recipient); */

        let person =await Person.findOne({email});



        if(person) throw {code: 11000};

        person=new Person({idCountry, name, lastname, email, phone, idContactChannel, termsCondition, legalPerson});
        await person.save();

        //jwt token


        return res.json({ok:true, person});
    } catch (error) {
        console.log(error);
        if(error.code===11000){
            return res.status(400).json({error: "Ya existe este usuario"});
        }
        return res.status(500).json({error: "Error de servidor"});
    }
}

 const getPersons= async(req,res) => {
    try {
        const persons = await Person.find();

         // Obtener personas de PostgreSQL
         const postgresPersons = await prisma.cargaexcel.findMany();

         // Combina los resultados en un único arreglo
        const allPersons = [...persons, ...postgresPersons];

        res.json(allPersons);

        //jwt token
    } catch (error) {
        console.log(error);

        return res.status(500).json({error: "Error de servidor"});
    }
}

 const registerPersonBasicInfo= async(req,res) => {

    const {idCountry, idTypePerson, name, email, phone, idContactChannel, dataPolicyCheck}=req.body;
    try {
        let person =await Person.findOne({email});
        if(person) throw {code: 11000};

        person=new Person({idCountry, idTypePerson, name, email, phone, idContactChannel, dataPolicyCheck});
        await person.save();

        //jwt token

        return res.json({ok:true});
    } catch (error) {
        console.log(error);
        if(error.code===11000){
            return res.status(400).json({error: "Ya existe este usuario"});
        }

        return res.status(500).json({error: "Error de servidor"});
    }

}

 const registerPersonPersonalData= async(req,res) => {

    const {email, dni, address, birthday, idLaboralActivity, professionoroccupation, idIncomeRange, idEducationLevel}=req.body;
    let registrationCode1;
    let registrationCode2;
    let registrationCode3;
    let registrationCode4;

    try {
        let person =await Person.findOne({email});

        if(person) {
            registrationCode1=random(0, 9);
            registrationCode2=random(0, 9);
            registrationCode3=random(0, 9);
            registrationCode4=random(0, 9);

            let UpdatedPerson = await Person.updateOne(person, { email, dni, address, birthday, idLaboralActivity, professionoroccupation, idIncomeRange, idEducationLevel, registrationCode1, registrationCode2, registrationCode3, registrationCode4});
            //Send email with registration code
            sendMailBelat(email, registrationCode1, registrationCode2, registrationCode3, registrationCode4);
        }else
        {
            return res.status(400).json({error: "Usuario no existe"});
        }
        
         

        return res.json({ok:true});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Error de servidor"});
    }

}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

 const registerPersonDeclarations= async(req,res) => {

    const { email, politicallyExposedPerson, taxResidence, usaCitizen, qualifiedInvestor, amlCheck}=req.body;

    try {
        let person =await Person.findOne({email});

        if(person) {
            let UpdatedPerson = await Person.updateOne(person, { email, politicallyExposedPerson, taxResidence, usaCitizen, qualifiedInvestor, amlCheck});
        }else
        {
            return res.status(400).json({error: "Usuario no existe"});
        }

        return res.json({ok:true});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Error de servidor"});
    }

}

 const registerPersonAmlCheck= async(req,res) => {

    const { email, amlCheck}=req.body;

    try {
        let person =await Person.findOne({email});

        if(person) {
            let UpdatedPerson = await Person.updateOne(person, { email, amlCheck});
        }else
        {
            return res.status(400).json({error: "Usuario no existe"});
        }

        return res.json({ok:true});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Error de servidor"});
    }

}

 const registerPersonIdentityVerification= async(req,res) => {

    const {email, dni}=req.body;

    try {
        let person =await Person.findOne({email});

        if(person) {
            let UpdatedPerson = await Person.updateOne(person, {
                email,
                dni
              });
            
        }else
        {
            return res.status(400).json({error: "Usuario no existe"});
        }

        return res.json({ok:true});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Error de servidor"});
    }

}

 const registerPersonUserValidation= async(req,res) => {

    const { email, password, repassword }=req.body;

    try {
        let person =await Person.findOne({email});

        if(person) {
            let UpdatedPerson = await Person.updateOne(person, { email, password, repassword});
        }else
        {
            return res.status(400).json({error: "Usuario no existe"});
        }

        

        return res.json({ok:true});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Error de servidor"});
    }
}

 const codeValidation= async(req,res) => {

    const { email, registrationCode1, registrationCode2, registrationCode3, registrationCode4}=req.body;

    console.log("newCode: " + registrationCode1 + registrationCode2 + registrationCode3 + registrationCode4);

    try {
        let person =await Person.findOne({email});

        if(person) {
            //Codigo de validación de codigo
            console.log("oldCode: " + person.registrationCode1 + person.registrationCode2 + person.registrationCode3 + person.registrationCode4);

            if(person.registrationCode1==registrationCode1 && person.registrationCode2==registrationCode2 && person.registrationCode3==registrationCode3 && person.registrationCode4==registrationCode4){
                console.log(true);
                return res.status(200).json({error: "Código verificado correctamente"});
            }else{
                console.log(false);
                return res.status(400).json({error: "Error de verificacion de código"});
            }
        }else
        {
            return res.status(400).json({error: "Usuario no existe"});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Error de servidor"});
    }
}

 const registerPersonInvestmentPlatformIntegration= async(req,res) => {

    const { idCountry, idTypePerson, name, email, phone, address, dni, password }=req.body;

    const newPhone="+" + phone.toString().trim();
    const newZone=idCountry.toString().charAt(0).toUpperCase() + idCountry.toString().slice(1).toLowerCase();;

    try {

            const res = await axios.post('https://plataforma.qa.bancaeticalat.com/APP/AAA/Inversionista.json', { 
            email: email,
            firstname: name,
            lastname: name,
            password: password,
            phone: newPhone,
            rut: dni,
            _zone: newZone,
            }, {
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "Content-Type": "application/json",
                }
            });

            console.log(res.status);
            console.log(res.statusText); 

        return res.json({ok:true});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Error de servidor"});
    }

    
}

 const registerPersonKycInvestmentPlatformIntegration= async(req,res) => {

    const { idCountry, idTypePerson, name, email, phone, address, dni, password }=req.body;

    try {

            const res = await axios.post('https://plataforma.qa.bancaeticalat.com/APP/KyCF/form.json', { 
            oft: null,
            dni: dni,
            origenFondos: true,
            pet: null,
            personaExpuesta: true,
            comprobanteUIF: null,
            dpt: null,
            AceptarDPT: true,
            drct: null,
            AceptarDRC: true,
            declaracionFinal: null,
            cuit: "27-28033514-8",
            //Falta agregar form-data para el archivo adjunto, quizás puede no ir (habría que probar)
             }, {
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "Content-Type": "application/json",
                }
            });
            
            console.log(res.status);
            console.log(res.statusText); 

        return res.json({ok:true});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: "Error de servidor"});
    }    
}

 const getPersonsInvestmentPlatform= async(req,res) => {

    try {
        const persons = await axios.get('https://chile.test.bancaeticalat.com/APP/AAA/Inversionista.json?type=data&sortBy=&sortDesc=false&perPage=5&currentPage=1&', {
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "Content-Type": "application/json",
                    "Cookie": "_ga=GA1.1.1402834784.1682361510; _fbp=fb.1.1682361510434.1377170608; _gcl_aw=GCL.1684157722.Cj0KCQjwsIejBhDOARIsANYqkD1--MA054Rh8IGhMS_joBhlgqT1wt3_zowqimsgFN0QfKahiv0DDDwaAi1OEALw_wcB; _ga_S9DWN3D0LP=GS1.1.1685028418.1.1.1685028429.0.0.0; _ga_LXC6K127SK=GS1.1.1685028418.11.1.1685028429.0.0.0; version=4.1.9; itdfw.sid=s%3AQyuXC8RwMvitslN-7_O-iVSQ7uaNfhCn.W%2FCjGyXpJ7Gqc4lyvsxH64FHAgRjuGxGK8vt0DSVuP4; _ga_B65QG3GEHD=GS1.1.1690922608.47.1.1690925630.0.0.0; _ga_46ZQEN0K7P=GS1.1.1690922608.41.1.1690925631.0.0.0",
                }
            });

        res.json(persons.data);

        //jwt token
    } catch (error) {
        console.log(error);
        if(error.code===11000){
            return res.status(400).json({error: "Ya existe este usuario"});
        }
        return res.status(500).json({error: "Error de servidor"});
    }
    
}
  

 const getCountries= async(req,res) => {

    try {
        const countries = await Country.find();
        res.json(countries);
        //jwt token
    } catch (error) {
        console.log(error);
        if(error.code===11000){
            return res.status(400).json({error: "Ya existe el país"});
        }

        return res.status(500).json({error: "Error de servidor"});
    }
}


 const updateManagementPerson= async(req,res) => {

    const { id } = req.params;
    const { management } = req.body;

    try {
        const person = await Person.findByIdAndUpdate(
            id,
            { management },
            { new: true }
          );

          if (!person) {
            return res.status(404).json({ error: "Persona no encontrada." });
          }

          return res.status(200).json({ message: "Campo 'management' actualizado correctamente.", person });
    } catch (error) {
        console.error("Error al actualizar el campo 'management':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateManagementPersonPost= async(req,res) => {

    let { id } = req.params;
    const { management } = req.body;

    console.log("estos datos llegan: " + id + management);
    id=parseInt(id);

    try {
        const updatedPerson = await prisma.cargaexcel.update({
            where: { id: id },
            data: { management: management },
          });

          return res.status(200).json({ message: "Campo 'management' actualizado correctamente.", updatedPerson });
    } catch (error) {
        console.error("Error al actualizar el campo 'management':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateNamePerson= async(req,res) => {

    const { id } = req.params;
    const { name } = req.body;

    try {
        const person = await Person.findByIdAndUpdate(
            id,
            { name },
            { new: true }
          );

          if (!person) {
            return res.status(404).json({ error: "Persona no encontrada." });
          }

          return res.status(200).json({ message: "Campo 'name' actualizado correctamente.", person });
    } catch (error) {
        console.error("Error al actualizar el campo 'name':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

 const updateNamePersonPost= async(req,res) => {

    let { id } = req.params;
    const { name } = req.body;  

    id=parseInt(id);

    try {
        const updatedPerson = await prisma.cargaexcel.update({
            where: { id: id },
            data: { name: name },
          });

          return res.status(200).json({ message: "Campo 'name' actualizado correctamente.", updatedPerson });
    } catch (error) {
        console.error("Error al actualizar el campo 'management':", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
}

// Exportaciones
module.exports = {
  testDeletRelationship,
  testDeletLegalPerson,
  putLegalPerson,
  postLegalPerson,
  updateNaturalPerson,
  getNaturalPersonPostgres,
  postNaturalPersonPostgres,
  putUser,
  getUser,
  postUser,
  testDirectRequest,
  updateBirthdayPersonPost,
  postRelationshipNaturalLegal,
  getPersons, 
  getCountries, 
  updateManagementPerson, 
  updateNamePerson, 
  updateLastNamePerson, 
  updateLastNamePersonPost, 
  updatePhonePerson, 
  updatePhonePersonPost,
  updateAddressPerson, 
  updateAddressPersonPost,
  updateInversorProfilePerson, 
  updateInversorProfilePersonPost, 
  updateResponsibleExecutivePerson, 
  updateResponsibleExecutivePersonPost, 
  updateInversorStatePerson, 
  updateStateOfProcessPerson, 
  updateResultPerson, 
  updateProfessionPerson, 
  updateIdTypePerson, 
  updateEducationLevelPerson, 
  updateLaboralActivityPerson, 
  updateIncomeRangePerson, 
  updateBirthdayPerson, 
  getPersonsInvestmentPlatform, 
  codeValidation,
  loginPerson, 
  bringPerson, 
  updateContactChannelPerson, 
  updateManagementPersonPost, 
  updateNamePersonPost, 
  updateInversorStatePersonPost, 
  updateStateOfProcessPersonPost, 
  updateResultPersonPost, 
  updateIdTypePersonPost, 
  updateContactChannelPersonPost, 
  updateProfessionPersonPost, 
  updateEducationLevelPersonPost, 
  updateLaboralActivityPersonPost, 
  updateIncomeRangePersonPost, 
  updateCountryPerson, 
  updateCountryPersonPost,
  registerPerson, 
  registerPersonAmlCheck, 
  registerPersonBasicInfo, 
  registerPersonDeclarations, 
  registerPersonIdentityVerification, 
  registerPersonPersonalData, 
  registerPersonUserValidation, 
  registerPersonInvestmentPlatformIntegration, 
};
