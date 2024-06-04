const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const {
  validateNoQueryParams
} = require('../utils/validation')

// Gets all profiles from the PostgreSQL database. 
const getProfilesPostgres = async (req, res) => {
  try {

    // Validate if the query has params, if has throw an error
    if(!validateNoQueryParams(req.query)) {
      return res.status(400).json({ error: 'No parameters allowed in the request' });
    }

    // If everything is fine, get the profiles
    const getProfiles = await prisma.profile.findMany();

    // Return the status, a confirmation message and the profiles
    return res.status(200).json({ok: true, getProfiles});
  } catch (error) {
    // Handle errors, print to console, and return a server error.
    console.log(error);
    return res.status(500).json({ error: "Server Error" });
  }
};

module.exports = {
  getProfilesPostgres
};