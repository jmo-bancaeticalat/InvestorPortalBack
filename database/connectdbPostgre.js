const { Client } = require('pg');

// URL de conexión al servidor externo PostgreSQL
const connectionString = process.env.DATABASE_URL;

// Crear una nueva instancia del cliente PostgreSQL
const client = new Client({
  connectionString: connectionString,
  connectionTimeoutMillis: 10000 // Tiempo de espera de 10 segundos (ajústalo según tus necesidades)
});

// Conectar a la base de datos
client.connect()
  .then(() => {
    console.log('Conexión exitosa a la base de datos');
  })
  .catch((err) => {
    console.error('Error al conectar a la base de datos', err);
  });
