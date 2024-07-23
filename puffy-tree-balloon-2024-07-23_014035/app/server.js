// Importar módulos necesarios
require('dotenv').config();
const fastify = require('fastify')({
  logger: false,
});
const { MongoClient } = require('mongodb');
const twilio = require('twilio');

// Credenciales de Twilio desde .env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Inicialización de cliente Twilio
const twilioClient = twilio(accountSid, authToken);

// URL de conexión de MongoDB Atlas
const uri = process.env.MONGODB_URI;

// Conectar a MongoDB
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function start() {
  try {
    await mongoClient.connect();
    fastify.decorate('mongoClient', mongoClient);
    console.log('Conexión exitosa a MongoDB');

    // Registrar plugin para manejar form body en Fastify
    fastify.register(require('@fastify/formbody'));

    // Configurar CORS usando fastify-cors para Fastify 3.x
    fastify.register(require('fastify-cors'), {
      origin: '*',
      methods: 'GET,POST,PUT,DELETE',
    });

    // Registrar rutas desde el archivo externo
    fastify.register(require('./routes'));

    // Obtener puerto desde las variables de entorno o usar puerto 3000
    const PORT = process.env.PORT || 3000;

    // Iniciar el servidor Fastify usando el método de escucha recomendado
    fastify.listen(PORT, '0.0.0.0', (err, address) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log(`Tu aplicación está escuchando en ${address}`);
    });

  } catch (err) {
    console.error('Error al conectar a MongoDB', err);
    process.exit(1);
  }
}

start();
