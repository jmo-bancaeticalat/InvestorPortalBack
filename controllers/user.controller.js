const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Generates a JWT token with the provided email as payload.
const generateToken = async (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Updates the password of an existing user in the database.
const putUpdatePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      const isSamePassword = await bcrypt.compare(newPassword, existingUser.password);

      if (isSamePassword) {
        return res.status(400).json({ error: "The new password cannot be the same as the old one" });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: {
          email: email,
        },
        data: {
          password: hashedNewPassword,
        },
      });

      return res.json({ ok: true, message: "Password updated successfully" });
    } else {
      return res.status(404).json({ error: "User not found" });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Handles the login logic of a user.
const postLoginUserPostgres = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "You must provide email and password" });
    }

    const existingUserMail = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!existingUserMail) {
      return res.status(400).json({ error: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, existingUserMail.password);

    if (!passwordMatch) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    const token = await generateToken(email);
    return res.json({ ok: true, token });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Creates a new user in the PostgreSQL database.
const postUserPostgres = async (req, res) => {
  const { email, password, terms_and_conditions, id_profile } = req.body;

  try {
    const existingUser = await prisma.user.findMany({
      where: {
        email: email,
      },
    });

    if (existingUser.length > 0) throw { code: 11000 };

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        registration_date: new Date(),
        terms_and_conditions,
        profile: {
          connect: { id_profile: id_profile }
        }
      },
    });

    sendMailUniquePortal(email);

    return res.json({ ok: true, createdUser });

  } catch (error) {

    console.log(error);

    if (error.code === 11000) {
      return res.status(400).json({ error: "This user already exists" });
    }

    return res.status(500).json({ error: "Server error" });
  }
};

// Retrieves information of users with their associated profiles filtered by an ID or by an email.
const getUserPostgres = async (req, res) => {
  try {
    const getUser = await prisma.user.findMany({
      include: {
        profile: {
          select: {
            name: true
          }
        }
      }
    });

    console.log("Users fetched successfully");
    res.json(getUser);

  } catch (error) {
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