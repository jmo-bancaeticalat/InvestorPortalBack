const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const {
    validateNumeric,
    validateNoQueryParams,
 } = require('../utils/validation')


// Gets income ranges filtered by country.
const getIncomeRanges = async (req, res) => {
    try {
        // Extract country ID from request query
        const { id_country } = req.query;

        // Check if country ID is provided
        if (!id_country) {
            return res.status(400).json({ error: 'Country code is missing' });
        }

        // Check if country ID is a valid format using the validate numeric function
        if (!validateNumeric(id_country)) {
            return res.status(400).json({ error: 'Country code format is invalid' });
        }
    
        // Retrieve all income ranges from the database
        const incomeRanges = await prisma.income_Range.findMany();
    
        // Filter income ranges based on the provided country ID
        const filteredIncomeRanges = incomeRanges.filter(incomeRange =>
            incomeRange.id_country === parseInt(id_country)
        );

        // If no ranges are found, consider the country code invalid
        if (filteredIncomeRanges.length === 0) {
            return res.status(404).json({ error: 'No existing income range for the country' });
        }
    
        // Return the filtered income ranges in JSON format
        return res.status(200).json({ incomeRanges: filteredIncomeRanges });
  
    } catch (error) {
        // Log and handle errors
        console.error('Error fetching income ranges:', error);
        return res.status(500).json({ error: 'Server error' });
    } 
};
  

// Gets occupations filtered by country.
const getOccupations = async (req, res) => {
    try {
        // Extract country ID from request query
        const { id_country } = req.query;

        // Check if country ID is provided
        if (!id_country) {
            return res.status(400).json({ error: 'Country ID is missing' });
        }

        // Check if country ID is a valid format using the reusable function
        if (!validateNumeric(id_country)) {
            return res.status(400).json({ error: 'Country ID format is invalid' });
        }

        // Convert country ID to an integer after validation
        const countryId = parseInt(id_country);

        // Retrieve all occupations from the database
        const occupations = await prisma.occupation.findMany();

        // Filter occupations based on the provided country ID
        const filteredOccupations = occupations.filter(occupation => 
            occupation.id_country === countryId
        );

        // If no occupations are found, consider the country code invalid
        if (filteredOccupations.length === 0) {
            return res.status(404).json({ error: 'No existing occupations for the country' });
        }

        // Return the filtered occupations in JSON format
        return res.status(200).json({ occupations: filteredOccupations });

    } catch (error) {
        // Log and handle errors
        console.error('Error fetching occupations:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


// Gets educational levels filtered by country.
const getEducationalLevel = async (req, res) => {
    try {
        // Extract country ID from request query
        const { id_country } = req.query;

        // Check if country ID is provided
        if (!id_country) {
            return res.status(400).json({ error: 'Country ID is missing' });
        }

        // Check if country ID is a valid format using the reusable function
        if (!validateNumeric(id_country)) {
            return res.status(400).json({ error: 'Country ID format is invalid' });
        }

        // Convert country ID to an integer after validation
        const countryId = parseInt(id_country);

        // Retrieve all educational levels from the database
        const educationalLevels = await prisma.educational_Level.findMany();

        // Filter educational levels based on the provided country ID
        const filteredEducationalLevels = educationalLevels.filter(educationalLevel =>
            educationalLevel.id_country === countryId
        );

        // If no educational levels are found, return an empty array
        if (filteredEducationalLevels.length === 0) {
            return res.status(404).json({ error: 'There are no educational levels available for this country ID' });
        }

        // Return the filtered educational levels in JSON format
        return res.status(200).json({ educationalLevels: filteredEducationalLevels });

    } catch (error) {
        // Log and handle errors
        console.error('Error fetching educational levels:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
  

// Gets all countries stored in PostgreSQL. 
const getCountriesPostgres = async(req,res) => {
    try {

        // Ensure no unexpected query parameters are present
        if (!validateNoQueryParams(req.query)) {
            return res.status(400).json({ error: 'Invalid request format' });
        }

        // Retrieve countries from PostgreSQL
        const postgresCountries = await prisma.country.findMany();
        
        // Return the countrys in JSON format
        res.status(200).json(postgresCountries);
  
    } catch (error) {
        
        // Log and handle errors
        console.log(error)
        return res.status(500).json({error: "Server error"});
    }
};

module.exports = {
    getIncomeRanges,
    getOccupations,
    getEducationalLevel,
    getCountriesPostgres
};
