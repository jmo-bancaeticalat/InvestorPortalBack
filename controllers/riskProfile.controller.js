const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const {
  validateNumeric,
  validateNoQueryParams
} = require('../utils/validation')

// Creates or updates the risk profile manually for a natural investment account.
const UpdateRiskProfileScale = async (req, res) => {
  try {
    // Extracts id_investment_account_natural and id_scales from the request body.
    const { id_investment_account_natural, id_scales } = req.body;

    // Checks if the investment account ID is provided.
    if (!id_investment_account_natural) {
      return res.status(400).json({ error: 'Investment account ID is missing' });
    }

    // Checks if the scales ID is provided.
    if (!id_scales) {
      return res.status(400).json({ error: 'Scales ID is missing' });
    }

    // Validates the format of the investment account ID.
    if (!validateNumeric(id_investment_account_natural)) {
      return res.status(400).json({ error: 'Investment account ID has an invalid format' });
    }

    // Validates the format of the scales ID.
    if (!validateNumeric(id_scales)) {
      return res.status(400).json({ error: 'Scales ID has an invalid format' });
    }

    // Checks if the investment account exists in the database.
    const existingNaturalAccount = await prisma.investment_Account_Natural.findUnique({
      where: {
        id_investment_account_natural: parseInt(id_investment_account_natural),
      },
    });

    // If the investment account does not exist, returns a 404 error.
    if (!existingNaturalAccount) {
      return res.status(404).json({ error: 'Investment account does not exist' });
    }

    // Checks if the scale exists in the database.
    const existingScale = await prisma.scales.findFirst({
      where: {
        id_scales: parseInt(id_scales),
      },
    });

    // If the scale does not exist, returns a 404 error.
    if (!existingScale) {
      return res.status(404).json({ error: 'Scales ID does not exist' });
    }

    // Checks if the risk profile exists for the provided investment account natural.
    const existingRiskProfile = await prisma.risk_Profile.findFirst({
      where: {
        id_investment_account_natural: id_investment_account_natural,
      },
    });

    // If the risk profile does not exist, returns a 404 error.
    if (!existingRiskProfile) {
      return res.status(404).json({ error: 'No risk profile found with the provided investment account natural.' });
    }

    // Checks if the provided scales ID is the same as the current one.
    if (existingRiskProfile.id_scales === parseInt(id_scales)) {
      return res.status(200).json({ ok: true, message: 'The risk profile scale is already up to date.' });
    }

    // Updates the risk profile with the new scales ID.
    const updatedRiskProfile = await prisma.risk_Profile.update({
      where: {
        id_risk_profile: existingRiskProfile.id_risk_profile,
      },
      data: {
        id_scales: id_scales,
      },
    });

    // Returns a success response with the updated risk profile data.
    return res.status(200).json({ ok: true, updatedRiskProfile });

  } catch (error) {
    // Handles errors, prints to console, and returns a server error.
    console.log(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Retrieves the risk profiles associated with a specific natural investment account.
const getRiskProfile = async (req, res) => {
  try {
    const { id_investment_account_natural } = req.query;

    // Checks if the investment account natural ID is provided.
    if (!id_investment_account_natural) {
      return res.status(400).json({ error: 'Missing id_investment_account_natural' });
    }

    // Validates the format of the investment account natural ID.
    if (!validateNumeric(id_investment_account_natural)) {
      return res.status(400).json({ error: 'Invalid format of investment account natural ID' });
    }

    // Checks if the natural investment account exists in the database.
    const existingNaturalAccount = await prisma.investment_Account_Natural.findUnique({
      where: {
        id_investment_account_natural: parseInt(id_investment_account_natural),
      },
    });

    // If the natural investment account does not exist, returns a 404 error.
    if (!existingNaturalAccount) {
      return res.status(404).json({ error: 'Natural investment account not found' });
    }

    // Retrieves the risk profiles associated with the provided investment account natural.
    const existingRiskProfiles = await prisma.risk_Profile.findMany({
      where: {
        id_investment_account_natural: parseInt(id_investment_account_natural),
      },
    });

    // If no risk profiles are found, returns a 404 error.
    if (existingRiskProfiles.length === 0) {
      return res.status(404).json({ error: 'No risk profiles found for the specified account' });
    }

    // Returns a success response with the retrieved risk profiles.
    return res.status(200).json(existingRiskProfiles);

  } catch (error) {
    // Handles errors, prints to console, and returns a server error.
    console.log(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Calculates the total score for a specific natural investment account.
const calculateTotalScore = async (id_investment_account_natural) => {

  // Retrieves the response selections for the specific natural investment account.
  const selections = await prisma.risk_Profile_Question_Selection.findMany({
    where: {
      id_investment_account_natural: parseInt(id_investment_account_natural),
    },
  });

  // Extracts the response IDs from the selections.
  const responseIds = selections.map(selection => selection.id_responses_risk_profile);
  
  // Retrieves the associated scores from the Responses_Risk_Profile table.
  const responses = await prisma.responses_Risk_Profile.findMany({
    where: {
      id_responses_risk_profile: {
        in: responseIds,
      },
    },
  });

  // Calculates the total sum of the associated scores.
  const totalScore = responses.reduce((sum, response) => sum + response.associated_response_score, 0);
  return totalScore;
};

// Finds the matched scale for a given total score.
const findMatchedScale = async (totalScore) => {
  // Retrieves all scales from the database.
  const scales = await prisma.scales.findMany({});
  // Finds and returns the scale that matches the total score within its range.
  return scales.find(scale => totalScore >= scale.min_value && totalScore <= scale.max_value);
};

// Creates a risk profile for a natural investment account using the responses to the risk profile questions.
const postRiskProfileForAccount = async (req, res) => {
  try {
    const { id_investment_account_natural } = req.body;

    // Checks if the investment account natural ID is provided.
    if (!id_investment_account_natural) {
      return res.status(400).json({ error: 'Missing id_investment_account_natural' });
    }

    // Validates the format of the investment account natural ID.
    if (!validateNumeric(id_investment_account_natural)) {
      return res.status(400).json({ error: 'Invalid format of investment account natural ID' });
    }

    // Checks if the natural investment account exists in the database.
    const existingNaturalAccount = await prisma.investment_Account_Natural.findUnique({
      where: {
        id_investment_account_natural: parseInt(id_investment_account_natural),
      },
    });

    // If the natural investment account does not exist, returns a 404 error.
    if (!existingNaturalAccount) {
      return res.status(404).json({ error: 'Natural investment account not found' });
    }

    // Check if a risk profile already exists for this investment account natural
    const existingRiskProfile = await prisma.risk_Profile.findFirst({
      where: {
        id_investment_account_natural: parseInt(id_investment_account_natural),
      },
    });

    // If a risk profile already exists, return an error
    if (existingRiskProfile) {
      return res.status(409).json({ error: 'Risk profile already exists for this account. Please update the existing risk profile' });
    }

    // Counts the number of response selections for the specific natural investment account.
    const validAnswers = await prisma.risk_Profile_Question_Selection.count({
      where: {
        id_investment_account_natural: parseInt(id_investment_account_natural),
      },
    });

    if (!(validAnswers === 6)) {
      return res.status(400).json({ error: 'Please answer all 6 risk profile questions' })
    }

    // Calculate total score using the separated function
    const totalScore = await calculateTotalScore(id_investment_account_natural);

    // Find matched scale using the separated function
    const matchedScale = await findMatchedScale(totalScore);

    // Create the Risk Profile in the database
    const createdRiskProfile = await prisma.risk_Profile.create({
      data: {
        total_score: totalScore,
        id_scales: matchedScale.id_scales,
        id_investment_account_natural: parseInt(id_investment_account_natural),
      },
    });

    // Returns a success response with the created risk profile.
    return res.status(200).json({ ok: true, createdRiskProfile });

  } catch (error) {
    // Handles errors, prints to console, and returns a server error.
    console.log(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Retrieves all risk scales.
const getScales = async (req, res) => {
  try {

    if (!validateNoQueryParams(req.query)) {
      return res.status(400).json({ error: 'Invalid request. No query parameters allowed.'})
    }

    const scales = await prisma.scales.findMany({});

    // Returns a success response with the scales.
    return res.status(200).json({scales});

  } catch (error) {
    // Handles errors, prints to console, and returns a server error.
    console.log(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Creates a single risk profile question selection associated with a natural investment account.
const postRiskProfileQuestionSelection = async (req, res) => {
  try {
    const { id_investment_account_natural, id_responses_risk_profile } = req.body;

    if (!id_investment_account_natural || !id_responses_risk_profile ) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    const createdRiskProfileQuestionSelection = await prisma.risk_Profile_Question_Selection.create({
      data: {
        id_investment_account_natural: id_investment_account_natural,
        id_responses_risk_profile: id_responses_risk_profile,
      },
    });

    return res.json({ok:true, createdRiskProfileQuestionSelection});

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Retrieves all risk profile question selections filtered by investment account ID.
const getRiskProfileQuestionSelection = async (req, res) => {
  try {
    const riskProfileQuestionSelection = await prisma.risk_Profile_Question_Selection.findMany({
      include: {
        responses_risk_profile: true,
      },
    });

    const mappedResults = riskProfileQuestionSelection.map((selection) => {
      return {
        id_risk_profile_question_selection: selection.id_risk_profile_question_selection,
        id_investment_account_natural: selection.id_investment_account_natural,
        id_responses_risk_profile: {
          id: selection.id_responses_risk_profile,
          answer: selection.responses_risk_profile.answer,
          associated_response_score: selection.responses_risk_profile.associated_response_score,  
          id_risk_profile_questions: selection.responses_risk_profile.id_risk_profile_questions
        },
      };
    });

    return res.json(mappedResults);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Retrieves the responses to risk profile questions filtering the request by country ID.
const getAnswersRiskQuestions = async(req,res) => {
  const { id_country } = req.query;

  if (!id_country) {
    return res.status(400).json({ error: "id_country is required"  });
  }
  try {
    const getAnswer = await prisma.responses_Risk_Profile.findMany();
    console.log("Profile question answers");
    res.json(getAnswer);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Retrieves the risk profile questions filtering the request by country ID.
const getRiskProfileQuestions = async(req,res) => {
  const { id_country } = req.query;

  if (!id_country) {
    return res.status(400).json({ error: "id_country is required" });
  }
  try {
    const getQuestions = await prisma.risk_Profile_Questions.findMany();
    console.log("Profile questions");
    res.json(getQuestions);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
    getRiskProfileQuestions,
    getAnswersRiskQuestions,
    getRiskProfileQuestionSelection,
    postRiskProfileQuestionSelection,
    getScales,
    postRiskProfileForAccount,
    getRiskProfile,
    UpdateRiskProfileScale
  };