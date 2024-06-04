const { generateRefreshToken, generateToken } = require('../utils/tokenManager.js');
const { User } = require('../models/User.js');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) throw { code: 11000 };

        user = new User({ email, password });
        await user.save();

        //jwt token

        return res.json({ ok: true });
    } catch (error) {
        console.log(error);
        if (error.code === 11000) {
            return res.status(400).json({ error: "Ya existe este usuario" });
        }

        return res.status(500).json({ error: "Error de servidor" });
    }

};

const login = async (req, res) => {

    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (!user) return res.status(403).json({ error: "No existe este usuario" });

        const respuestaPassword = await user.comparePassword(password);
        if (!respuestaPassword) {
            return res.status(403).json({ error: "Contraseña incorrecta" });
        }

        //Generar el token JWT

        const { token, expiresIn } = generateToken(user.id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: !(process.env.MODO === "developer"),
        });

        generateRefreshToken(user.id, res);

        return res.json({ token, expiresIn });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Error de servidor" });
    }

};

const infoUser = async (req, res) => {
    try {
        const user = await User.findById(req.uid).lean();
        return res.json({ email: user.email, uid: user.id });
    } catch (error) {
        return res.status(500).json({ error: "Error de server" })
    }
}

module.exports = {
    register,
    login,
    infoUser
};
