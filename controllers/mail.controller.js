//todo: Modify links to redirect to bancaeticalat.com/verificacion and /update-password

const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const {
    validateEmail,
 } = require('../utils/validation')

// Defining the function to generate the token
const generateToken = async (email) => {
    // Create a payload object with the email
    const payload = { email };

    // Get the secret to sign the token from an environment variable
    const secret = process.env.JWT_SECRET;

    // Use the 'sign' method from jsonwebtoken to generate the token
    // The token will expire in 1 hour ('1h')
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    return token;

}

// Function to create a link with the token
const generateVerificationLink = async (email) => {
    const token = await generateToken(email);
    const link = `http://localhost:5000/api/v1/getVerifyToken?token=${token}&email=${encodeURIComponent(email)}`;
    return link;
}

// Password update link generation function
const createPasswordUpdateLink = async (email) => {
    const token = await generateToken(email);
    const updatePasswordLink = `http://localhost:5000/api/v1/updatePasswordLink?token=${token}&email=${encodeURIComponent(email)}`;
    return updatePasswordLink;
}

// Email sending function
const sendEmail = async (email, subject, text) => {
    const mailTransporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailDetails = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: text,
    };

    try {
        const result = await mailTransporter.sendMail(mailDetails);
        console.log('Email sent successfully', result);
    } catch (error) {
        console.error('Error sending email', error);
        throw error;
    }
}

// Verifies a token received via email.
const getVerifyToken = async (req, res) => {
    
    // Get the token and email from the query parameters
    const token = req.query.token;
    const email = req.query.email;             

    // Get the secret key for verifying the token from environment variables   
    const secret = process.env.JWT_SECRET;

    // Check if the token is present
    if (!token) {
        return res.status(400).send('Missing token');
    }

    // Check if the email is present
    if (!email) {
        return res.status(400).send('Missing email');
    } 

    // Check if the email is valid
    if (!validateEmail(email)) {
        return res.status(400).send('Invalid email');
    }

    try {

        // Try to verify and decode the token using the secret key
        const decoded = jwt.verify(token, secret);

        // Check if the email from the decoded token matches the provided email
        if (decoded.email !== email) {
            return res.status(400).send('Email does not match token');
        }

        // If everything is okay, respond with a 200 status
        return res.status(200).send('Email verified successfully');

    } catch (error) {
        // If the token has expired, respond with a 401 error
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send('Token has expired');
        } 

        // If the token is invalid, respond with a 400 error
        else if (error.name === 'JsonWebTokenError') {
            return res.status(400).send('Invalid token');
        } 

        // Handle other errors, log them to the console, and return a server error
        else {
            console.error(error);
            return res.status(500).json({ error: "Server error" });
        }
    }
}

// Resends the registration confirmation email to a user. 
const postResendMail = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if the email is present
        if(!email){
            return res.status(400).json({message: 'Email is missing.'});
        }

        // Check if the email is valid
        if(!validateEmail(email)){
            return res.status(400).json({message: 'Email is invalid.'});
        }
        
        // Check if the user with the email exists
        const existingUser = await prisma.user.findFirst({
            where: {
                email: email,
            },
        });

        // If not return an error
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });

        } 

        // Create a verification link with the user's email
        const verificationLink = await generateVerificationLink(email);

        // Send an email to the user's email with the verification link
        await sendEmail(
            email,
            'Email de verificación - Banca Etica',
            `Haz clic en el siguiente enlace para verificar tu correo electrónico: ${verificationLink}`
        );

        // If everything is okay, respond with a 200 status
        return res.status(200).json({ ok: true, message: "Email resent successfully" });
        
    } catch (error) {

        // Handle errors, print to console, and return a server error.
        console.error(error);
        return res.status(500).json({ error: "Server error" });
        
    }
};

// Sends an email with the password update link. 
const sendPasswordUpdateLink = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if the email is present
        if (!email) {
            return res.status(400).json({ message: 'Email is missing.' });
        }

        // Check if the email is valid
        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Email is invalid.' });
        }

        // Check if the user with the email exists
        const existingUser = await prisma.user.findFirst({
            where: {
                email: email,
            },
        });

        // If not return an error
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Create a update password link with the user's email
        const updatePasswordLink = createPasswordUpdateLink(email)

        // Send an email to the user's email with the update password link
        await sendEmail(
            email,
            'Actualización de Contraseña - Banca Etica',
            `Haz clic en el siguiente enlace para actualizar tu contraseña: ${updatePasswordLink}`
        );

        // If everything is okay, respond with a 200 status
        return res.status(200).json({ ok: true, message: "Email sent successfully for password update" });
        
    } catch (error) {
        
        // Handle errors, print to console, and return a server error.
        console.error('Error sending email', error);
        return res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    getVerifyToken,
    generateToken,
    generateVerificationLink,
    postResendMail,
    sendPasswordUpdateLink
};
