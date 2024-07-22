const { postUserPostgres } = require('./user.controller');
const { postNaturalPersonPostgres } = require('./person.controller');

const createUserandNaturalPerson = async (req, res) => {
  try {
    const { email, password, terms_and_conditions, name, lastname } = req.body;

    // Crear usuario
    const user = await postUserPostgres(email, password, terms_and_conditions);
    console.log('Usuario creado:', user);

    // Crear persona natural
    const naturalPerson = await postNaturalPersonPostgres(name, lastname, user.id_user);
    console.log('Persona natural creada:', naturalPerson);


    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user,
      message: 'Persona natural creado exitosamente',
      naturalPerson,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createUserandNaturalPerson
};
