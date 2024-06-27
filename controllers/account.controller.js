const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const {
    validateNumeric,
    validateAlphabetic,
    validateBoolean,
 } = require('../utils/validation')


// Obtains the tax residency of a user according to their investment account.
const getTaxResidency = async (req, res) => {
    const { accountId } = req.query;

    try {

        // Check if accountId is missing in the request
        if (!accountId){
            return res.status(400).json({ error: "Account ID is missing" });
        }

        // Check if the account ID has a valid format (only digits) and is not NaN.
        if (!validateNumeric(accountId)) {
            return res.status(400).json({ error: "Invalid account ID format" });
        }

        // Search for an existing user in the database with the provided natural investment account ID.
        const existingUser = await prisma.investment_Account_Natural.findUnique({
            where: {
                id_investment_account_natural: parseInt(accountId)
            }
        });

        // If the user does not exist, return a 404 error.
        if (!existingUser){
            return res.status(404).json({ error: "User not found" });
        }

        // Query the database to get tax residencies associated with the specified natural investment account ID.
        const taxResidency = await prisma.country_Tax_Residence.findMany({
            where: {
                id_investment_account_natural: parseInt(accountId)
            }
        });

        // Check if no tax residency records were found and, if so, respond with a message indicating that the residence is not defined for this user.
        if (taxResidency.length === 0) {
            return res.status(200).json({ message: "Residence is not defined for this user."});
        }
        
        // Return the found tax residency data as JSON with a 200 status code.
        res.status(200).json({taxResidency });

    } catch (error) {

        // Handle errors, print to console, and return a server error.
        console.error(error);
        return res.status(500).json({ error: "Server error" });
        
    }
};

// Creates a new tax residency record for a user and their investment account.
const postTaxResidency = async (req, res) => {
    const { countryId, accountId } = req.body;

    try {

        // Check if accountId is missing in the request
        if (!accountId) {
            return res.status(400).json({ error: "Missing account ID" });
        }

        // Check if countryId is missing in the request
        if (!countryId) {
            return res.status(400).json({ error: "Missing country ID" });
        }

        // Check if the account ID has a valid format (only digits) and is not NaN.
        if (!validateNumeric(accountId)) {
            return res.status(400).json({ error: "Invalid account ID format" });
        }

        // Check if the country ID has a valid format (only digits) and is not NaN.
        if (!validateNumeric(countryId)) {
            return res.status(400).json({ error: "Invalid country ID format" });
        }

        const countryExists = await prisma.country.findUnique({
            where: { id_country: countryId }
        })

        if (!countryExists) {
            return res.status(404).json({ error: "Country does not exist" });
        }

        // Check if the investment account exists in the database
        const accountExists = await prisma.investment_Account_Natural.findUnique({
            where: { id_investment_account_natural: accountId }
        });

        // If the account doesn't exist, return an error response
        if (!accountExists) {
            return res.status(404).json({ error: "The investment account does not exist." });
        }

        // Check if a tax residency record already exists for this user
        const existingResidency = await prisma.country_Tax_Residence.findFirst({
            where: {
                id_investment_account_natural: accountId
            }
        });

        // If a residency record already exists, return a conflict error
        if (existingResidency) {
            return res.status(409).json({ error: "A tax residency record already exists for this user. Use the update function to modify it." });
        }

        // Create a new tax residency record for the user
        const newTaxResidency = await prisma.country_Tax_Residence.create({
            data: {
                id_investment_account_natural: accountId,
                id_country: countryId
            }
        });

        // Return the New tax residency data as JSON with a 201 status code.
        res.status(201).json({ newTaxResidency });
    } catch (error) {

        // Handle errors, print to console, and return a server error.
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};

//? Añadir un putTaxResidency

// Registers a Politically Exposed Person (PEP) in the system, associated with a natural investment account.
const postPEP = async (req, res) => {
    const { id_investment_account_natural, position_held, pep_relationship, name_pep, id_country } = req.body;

    try {

        // Check if id_investment_account_natural is missing in the request
        if (!id_investment_account_natural) {
            return res.status(400).json({ error: "Missing account ID" });
        }

        // Check if id_country is missing in the request
        if (!id_country) {
            return res.status(400).json({ error: "Missing country ID" });
        }

        // Check if position_held is missing in the request
        if (!position_held) {
            return res.status(400).json({ error: "Missing Position held" });
        }

        // Check if pep_relationship is missing in the request
        if (!pep_relationship) {
            return res.status(400).json({ error: "Missing PEP relationship" });
        }

        // Check if pep_relationship is missing in the request
        if (!name_pep) {
            return res.status(400).json({ error: "Missing PEP name" });
        }

        // Check if the id_investment_account_natural has a valid format (only digits) and is not NaN.
        if (!validateNumeric(id_investment_account_natural)) {
            return res.status(400).json({ error: "Invalid account ID format" });
        }

        // Check if the country ID has a valid format (only digits) and is not NaN.
        if (!validateNumeric(id_country)) {
            return res.status(400).json({ error: "Invalid country ID format" });
        }

        // Check if the position held contains only alphabetic characters
        if (!validateAlphabetic(position_held)) {
            return res.status(400).json({ error: "Position held must contain only alphabetic characters" });
        }

        // Check if the PEP relationship contains only alphabetic characters
        if (!validateAlphabetic(pep_relationship)) {
            return res.status(400).json({ error: "PEP Relationship must contain only alphabetic characters" });
        }

        // Check if the PEP name contains only alphabetic characters    
        if (!validateAlphabetic(name_pep)) {
            return res.status(400).json({ error: "PEP Name must contain only alphabetic characters" });
        }
    
        // Check if the investment account exists
        const existingAccount = await prisma.investment_Account_Natural.findFirst({
            where: {
                id_investment_account_natural: id_investment_account_natural,
            },
        });

        // If the account doesn't exist, return an error response
        if (!existingAccount) {
            return res.status(404).json({ error: "The investment account does not exist" });
        }

        // Check if the country exists
        const countryExists = await prisma.country.findUnique({
            where: { id_country: id_country }
        })

        // If the country doesn't exist, return an error response
        if (!countryExists) {
            return res.status(404).json({ error: "Country does not exist" });
        }

       // Check if the investment account already has a defined PEP. If the value is not 0, it has a pep already associated
       const existingPEP = await prisma.investment_Account_Natural.findFirst({
        where: {
            id_investment_account_natural: id_investment_account_natural,
        },
        include: {
            pep: {
                select: {
                    id_pep: true
                }
            }
        }
    });
        
        // If the investment account already has a defined PEP, return a conflict error
        if (existingPEP.id_pep !== 0) {
            return res.status(409).json({ error: "This investment account already has a defined PEP." });
        }
        
        // Create a new PEP register
        const newRegister = await prisma.pEP.create({
            data: {
                position_held: position_held,
                pep_relationship: pep_relationship,
                name_pep: name_pep,
                id_country: id_country
            }
        });

        // Respond with the newly created PEP register
        res.status(201).json(newRegister);

    } catch (error) {

        // Handle errors, print to console, and return a server error.
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};

//? Añadir putPEP

// Updates the status of whether a natural investment account holder is or isn't a Politically Exposed Person (PEP).
const putIfPEP = async (req, res) => {
    const { id_investment_account_natural, if_pep } = req.body;

    try {

        // Check if id_investment_account_natural is missing in the request
        if (!id_investment_account_natural) {
            return res.status(400).json({ error: "Missing account ID" });
        }

        // Check if if_pep is missing in the request
        if (if_pep === undefined || if_pep === null) {
            return res.status(400).json({ error: "Missing PEP boolean" });
        }

        // Check if the id_investment_account_natural has a valid format (only digits) and is not NaN.
        if (!validateNumeric(id_investment_account_natural)) {
            return res.status(400).json({ error: "Invalid account ID format" });
        }

        // Validate if_pep is a boolean
        if (!validateBoolean(if_pep)) {
            return res.status(400).json({ error: "Invalid PEP boolean format" });
        }

        // Check if the investment account exists
        const existingAccount = await prisma.investment_Account_Natural.findFirst({
            where: {
                id_investment_account_natural: id_investment_account_natural,
            },
        });

        // Return an error if the investment account does not exist
        if (!existingAccount) {
            return res.status(404).json({ error: "The investment account does not exist" });
        }

        // Check if the PEP status is already updated
        if (existingAccount.if_pep === if_pep) {
            return res.status(200).json({ message: "The PEP status is already updated." });
        }

        // Update the PEP status of the investment account
        const updatedAccount = await prisma.investment_Account_Natural.update({
            where: {
                id_investment_account_natural: id_investment_account_natural,
            },
            data: {
                if_pep: if_pep,
            },
        });

        // Return the updated account
        return res.status(200).json(updatedAccount );

    } catch (error) {

        // Handle errors, print to console, and return a server error.
        console.error(error);
        return res.status(500).json({ error: "Server error" });

    }
};

// Updates the Anti Money Laundering (AML) status of a natural investment account.
const putIfAML = async (req, res) => {
    const { id_investment_account_natural, if_AML } = req.body;

    try {

        
        // Check if id_investment_account_natural is missing in the request
        if (!id_investment_account_natural) {
            return res.status(400).json({ error: "Missing account ID" });
        }

        // Check if if_AML is missing in the request
        if (if_AML === undefined || if_AML === null) {
            return res.status(400).json({ error: "Missing AML boolean" });
        }

        // Check if the id_investment_account_natural has a valid format (only digits) and is not NaN.
        if (!validateNumeric(id_investment_account_natural)) {
            return res.status(400).json({ error: "Invalid account ID format" });
        }

        // Validate if_AML is a boolean
        if (!validateBoolean(if_AML)) {
            return res.status(400).json({ error: "Invalid AML boolean format" });
        }

        // Check if the investment account exists
        const existingAccount = await prisma.investment_Account_Natural.findFirst({
            where: {
                id_investment_account_natural: id_investment_account_natural,
            },
        });

        // Return an error if the investment account does not exist
        if (!existingAccount) {
            return res.status(404).json({ error: "The investment account does not exist" });
        }

        // Check if the PEP status is already updated
        if (existingAccount.if_AML === if_AML) {
            return res.status(200).json({ message: "The AML status is already updated." });
        }

        // Update the AML status of the investment account
        const updatedAccount = await prisma.investment_Account_Natural.update({
            where: {
                id_investment_account_natural: id_investment_account_natural,
            },
            data: {
                if_AML: if_AML,
            },
        });

        // Return the updated account
        return res.status(200).json(updatedAccount);

    } catch (error) {

        // Handle errors, print to console, and return a server error.
        console.error(error);
        return res.status(500).json({ error: "Server error" });

    }
};

// Updates the status of whether a natural investment account holder is or isn't a Qualified Investor.
const putQualifiedInvestor = async (req, res) => {
    const { id_investment_account_natural, if_qualified_investor } = req.body;

    try {

        // Check if id_investment_account_natural is missing in the request
        if (!id_investment_account_natural) {
            return res.status(400).json({ error: "Missing account ID" });
        }

        // Check if if_qualified_investor is missing in the request
        if (if_qualified_investor === undefined || if_qualified_investor === null) {
            return res.status(400).json({ error: "Missing qualified investor boolean" });
        }

        // Check if the id_investment_account_natural has a valid format (only digits) and is not NaN.
        if (!validateNumeric(id_investment_account_natural)) {
            return res.status(400).json({ error: "Invalid account ID format" });
        }

        // Validate if_qualified_investor is a boolean
        if (!validateBoolean(if_qualified_investor)) {
            return res.status(400).json({ error: "Invalid qualified investor boolean format" });
        }

        // Check if the investment account exists
        const existingAccount = await prisma.investment_Account_Natural.findFirst({
            where: {
                id_investment_account_natural: id_investment_account_natural,
            },
        });

        // Return an error if the investment account does not exist
        if (!existingAccount) {
            return res.status(404).json({ error: "The investment account does not exist" });
        }

        // Check if the qualified investor status is already updated
        if (existingAccount.if_qualified_investor === if_qualified_investor) {
            return res.status(200).json({ message: "The qualified investor status is already updated." });
        }

        // Update the if_qualified_investor status of the investment account
        const updatedAccount = await prisma.investment_Account_Natural.update({
            where: {
                id_investment_account_natural: id_investment_account_natural,
            },
            data: {
                if_qualified_investor: if_qualified_investor,
            },
        });

        // Return the updated account
        return res.status(200).json(updatedAccount);

    } catch (error) {

        // Handle errors, print to console, and return a server error.
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};

// Obtains information about a legal investment account based on its ID.
const getInvestmentAccountLegal = async (req, res) => {
    const { id_investment_account_legal } = req.query;

    try {

        // Check if id_investment_account_legal is missing in the request
        if (!id_investment_account_legal) {
            return res.status(400).json({ error: "Missing account ID" });
        }

        // Check if the id_investment_account_legal has a valid format (only digits) and is not NaN.
        if (!validateNumeric(id_investment_account_legal)) {
            return res.status(400).json({ error: "Invalid account ID format" });
        }

        // Check if the investment account exists
        const existingAccount = await prisma.investment_Account_Legal.findUnique({
            where: {
                id_investment_account_legal: parseInt(id_investment_account_legal),
            },
        });

        // Return an error if the investment account does not exist
        if (!existingAccount) {
            return res.status(404).json({ error: "The investment account does not exist" });
        }

        // Return the account
        return res.status(200).json(existingAccount);

    } catch (error) {

        // Handle errors, print to console, and return a server error.
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};

// Creates a new legal investment account associated with a legal entity.
const postInvestmentAccountLegal = async (req, res) => {
    const { id_legal_person } = req.body;

    try {

        // Check if id_legal_person is missing in the request
        if (!id_legal_person) {
            return res.status(400).json({ error: "Missing legal person ID" });
        }

        // Check if the ID of the legal person has a valid format (only digits) and is not NaN.
        if (!validateNumeric(id_legal_person)) {
            return res.status(400).json({ error: "Invalid legal person ID format" });
        }

        // Check if the legal person exists in the data base
        const existingLegalPerson = await prisma.legal_Person.findFirst({
            where: {
                id_legal_person: id_legal_person,
            },
        });

        // Return an error if the legal person does not exist
        if (!existingLegalPerson) {
            return res.status(404).json({ error: "The legal person does not exist" });
        }

        // Create a new investment account for a legal person
        const createdInvestmentAccountLegal = await prisma.investment_Account_Legal.create({
            data: {
                id_legal_person: id_legal_person
            }
        });

        // Return a success response with the created investment account
        return res.status(201).json({ ok: true, createdInvestmentAccountLegal });

    } catch (error) {

        // Handle errors, print to console, and return a server error.
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};

// Creates a new natural investment account in the system.
const postInvestmentAccountNatural = async (req, res) => {
    try {
        const {
            id_natural_person,
            identifier_national_number,
            // identifier_tax_number,
            // id_country_account,
            // id_educational_level,
            // passaport,
            // id_occupation,
            // id_income_range,
            // if_qualified_investor,
            // if_pep,
            // id_pep,
            // id_risk_profile,
            // if_CRS, 
        } = req.body;

        // Default ID for optional auxiliar tables 
        const defaultId = 0;    

        // Check if id_natural_person is missing in the request
        if (!id_natural_person) {
            return res.status(400).json({ error: 'Missing natural person ID' });
        }

        if (!identifier_national_number) {
            return res.status(400).json({ error: 'Missing identifier national number'})
        }
        
        // Check if the ID of the natural person has a valid format (only digits) and is not NaN.
        if (!validateNumeric(id_natural_person)) {
            return res.status(400).json({ error: "Invalid natural person ID format" });
        }
        
        // Validate identifier_national_number format (digits and hyphens only)
        if (!/^[\d-]+$/.test(identifier_national_number)) {
            return res.status(400).json({ error: "Invalid national identifier number format. It must contain only digits and hyphens." });
        }

        // Validate if the length of the identifier_national_number is between 9 and 11 characters
        if (identifier_national_number.length < 9 || identifier_national_number.length > 11) {
            return res.status(400).json({ error: "National identifier number must be between 9 and 11 characters long." });
        }

        // Validate the position of the hyphen in identifier_national_number
        if (!/^\d{7,9}-\d$/.test(identifier_national_number)) {
            return res.status(400).json({ error: "Invalid national identifier number format. It must have a hyphen in the penultimate position and end with a digit." });
        }

        // Check if the natural person exists in the database
        const existingNaturalPerson = await prisma.natural_Person.findFirst({
            where: {
                id_natural_person: id_natural_person,
            },
        });

        // Return an error if the natural person does not exist
        if (!existingNaturalPerson) {
            return res.status(404).json({ error: "The natural person does not exist" });
        }

        // Create a new investment account for a natural person
        const createdInvestmentAccountNatural = await prisma.investment_Account_Natural.create({
            data: {
                id_natural_person: id_natural_person,
                identifier_national_number: identifier_national_number,
                // identifier_tax_number,
                id_country_account:  defaultId, 
                id_educational_level:  defaultId,
                // passaport,
                id_occupation: defaultId,
                id_income_range: defaultId,
                // if_qualified_investor,
                // if_pep,
                id_pep: defaultId,
                // id_risk_profile,
                // if_CRS,
            },
        });

        // Return a success response with the created investment account    
        return res.status(201).json({ ok: true, createdInvestmentAccountNatural });

    } catch (error) {

        // Handle errors, print to console, and return a server error.
        console.log(error);
        return res.status(500).json({ error: "Server error" });
    }
};

// Obtains information about all natural investment accounts stored in the PostgreSQL database.
const getInvestmentAccountNaturalPostgres = async (req, res) => {

    const { id_investment_account_natural } = req.query;

    try {

        // Check if id_investment_account_natural is missing in the request
        if (!id_investment_account_natural) {
            return res.status(400).json({ error: "Missing account ID" });
        }
        
        // Check if the id_investment_account_natural has a valid format (only digits) and is not NaN.
        if (!validateNumeric(id_investment_account_natural)) {
            return res.status(400).json({ error: "Invalid account ID format" });
        }

        // Check if the investment account exists
        const existingAccount = await prisma.investment_Account_Natural.findUnique({
            where: {
                id_investment_account_natural: parseInt(id_investment_account_natural),
            },
        });

        // Return an error if the investment account does not exist
        if (!existingAccount) {
            return res.status(404).json({ error: "The investment account does not exist" });
        }

        // Return the account
        return res.status(200).json(existingAccount);
        

    } catch (error) {
        // Handle errors, print to console, and return a server error.
        console.log(error);
        return res.status(500).json({ error: "Server error" });
    }
};

module.exports = {
    getTaxResidency,
    postTaxResidency,
    postPEP,
    putIfPEP,
    putIfAML,
    putQualifiedInvestor,
    getInvestmentAccountLegal,
    postInvestmentAccountLegal,
    postInvestmentAccountNatural,
    getInvestmentAccountNaturalPostgres
};
