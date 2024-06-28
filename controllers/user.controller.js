const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const {
  validateEmail,
  validatePassword,
  validateBoolean,
  validateNumeric
} = require('../utils/validation')


// Generates a JWT token with the provided email as payload.
const generateToken = async (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Updates the password of an existing user in the database.
const putUpdatePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ error: 'Email is missing' });
    }

    // Check if new password is provided
    if (!newPassword) {
      return res.status(400).json({ error: 'New password is missing' });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate new password format
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // Find existing user by email
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    // Check if user exists
    if (existingUser) {

      // Compare the new password with the existing one
      const isSamePassword = await bcrypt.compare(newPassword, existingUser.password);

      // If the new password is the same as the old one, return an error
      if (isSamePassword) {
        return res.status(400).json({ error: "The new password cannot be the same as the old one" });
      }
    } else {
      // If user is not found, return a 404 error
      return res.status(404).json({ error: "User not found" });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        password: hashedNewPassword,
      },
    });

    // Return success response
      return res.json({ ok: true, message: "Password updated successfully" });


  } catch (error) {
    // Handle errors, print to console, and return a server error.
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Handles the login logic of a user.
const postLoginUserPostgres = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if password is provided
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    // Find user by email
    const existingUserMail = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    // Check if user exists
    if (!existingUserMail) {
      return res.status(400).json({ error: "User not found" });
    }

    // Compare provided password with the stored hashed password 
    const passwordMatch = await bcrypt.compare(password, existingUserMail.password);

    // If password does not match, return an error
    if (!passwordMatch) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    // Generate a token for the user
    const token = await generateToken(email);
  
    // Return success response with the token
    return res.status(200).json({ ok: true, token });

  } catch (error) {
    // Handle errors, print to console, and return a server error.
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};


// Creates a new user in the PostgreSQL database.
const postUserPostgres = async (req, res) => {

  try {
    const { email, password, terms_and_conditions } = req.body;

    //* administrator as default profile
    const adminUser = 2;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if password is provided
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Check if terms and conditions are accepted
    if (!terms_and_conditions) {
      return res.status(400).json({ error: 'Accepting the terms and conditions is required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    if (!validateBoolean(terms_and_conditions)) {
      return res.status(400).json({ error: 'Invalid terms and conditions' });
    }
  
    // Validate new password format
    const passwordError = validatePassword(password);

    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // Check if a user with the given email already exists
    const existingUser = await prisma.user.findMany({
      where: {
        email: email,
      },
    });

    // If user exists, return an error
    if (existingUser.length !== 0) {
      return res.status(400).json({ error: 'There is already a user created with this email' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const createdUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        registration_date: new Date(),
        terms_and_conditions,
        profile: {
          connect: { id_profile: adminUser },
        },
      },
    });

    // Return success response with the created user
    return res.status(201).json({ ok: true, createdUser });

  } catch (error) {
    // Handle errors, print to console, and return a server error.
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
};


// Retrieves information of users with their associated profiles filtered by an ID.
const getUserPostgres = async (req, res) => {
  try {
    const { id_user } = req.query;

    // Check if user ID is provided
    if (!id_user) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!validateNumeric(id_user)) {
      return res.status(400).json({ error: 'Invalid User ID' });
    }

    // Retrieve user information along with their profile name
    const getUser = await prisma.user.findMany({
      where: {
        id_user: parseInt(id_user),  // Ensure the ID is parsed as an integer
      },
      include: {
        profile: {
          select: {
            name: true,  // Include only the name of the profile
          },
        },
      },
    });

    // If user does not exist, return an error 
    if (getUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return the retrieved user information
    return res.status(200).json(getUser);

  } catch (error) {
    // Handle errors, print to console, and return a server error.
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
};


module.exports = {
    getUserPostgres,
    postUserPostgres,
    postLoginUserPostgres,
    putUpdatePassword
};