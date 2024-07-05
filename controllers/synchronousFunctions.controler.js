const { postUserPostgres } = require('./user.controller');
const { postNaturalPersonPostgres } = require('./person.controller');
const { postInvestmentAccountNatural } = require('./account.controller');

const createUser = async (req, res) => {
  try {
    const { email, password, terms_and_conditions, name, lastname, identifier_national_number } = req.body;

    // Crear usuario
    const user = await postUserPostgres(email, password, terms_and_conditions);
    console.log('Usuario creado:', user);

    // Crear persona natural
    const naturalPerson = await postNaturalPersonPostgres(name, lastname, user.id_user);
    console.log('Persona natural creada:', naturalPerson);

    const id_natural_person = naturalPerson.id_natural_person
    // Crear cuenta natural
    const investmentAccountNatural = await postInvestmentAccountNatural(id_natural_person,identifier_national_number);
    console.log('Cuenta natural creada:', investmentAccountNatural);

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user,
      message: 'Persona natural creado exitosamente',
      naturalPerson,
      message: 'Cuenta de inversion creada exitosamente',
      investmentAccountNatural,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createUser
};
