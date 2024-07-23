const { ObjectId } = require("mongodb"); // Importar ObjectId desde mongodb

module.exports = async function (fastify, opts) {
  // Ruta para guardar mensaje de WhatsApp
  fastify.post("/whatsapp", async (request, reply) => {
    const incomingMessage = request.body.Body;
    const from = request.body.From;
    console.log(`Mensaje recibido de ${from}: ${incomingMessage}`);

    // Guardar en MongoDB
    const db = fastify.mongoClient.db("what"); // Nombre de la base de datos en MongoDB
    const collection = db.collection("mensajes"); // Nombre de la colección en MongoDB

    try {
      const result = await collection.insertOne({
        numero: from,
        mensaje: incomingMessage,
        timestamp: new Date(),
      });
      console.log(`Mensaje guardado en MongoDB con ID: ${result.insertedId}`);
      reply.status(200).send("Mensaje guardado exitosamente en MongoDB");
    } catch (err) {
      console.error("Error al guardar mensaje en MongoDB", err);
      reply.status(500).send("Error al guardar mensaje en MongoDB");
    }

    // Responder al mensaje de WhatsApp
    reply.type("text/xml").send("<Response></Response>");
  });

  // Ruta para seleccionar todos los mensajes guardados
  fastify.get("/whatsapp/mensajes", async (request, reply) => {
    const db = fastify.mongoClient.db("what");
    const collection = db.collection("mensajes");

    try {
      const mensajes = await collection.find({}).toArray();
      reply.status(200).send(mensajes);
    } catch (err) {
      console.error("Error al obtener mensajes desde MongoDB", err);
      reply.status(500).send("Error al obtener mensajes desde MongoDB");
    }
  });

  // Ruta para eliminar un mensaje por su ID
  fastify.delete("/whatsapp/mensajes/:id", async (request, reply) => {
    const { id } = request.params;

    try {
      const db = fastify.mongoClient.db("what"); // Nombre de la base de datos en MongoDB
      const collection = db.collection("mensajes"); // Nombre de la colección en MongoDB

      // Convertir el ID de string a ObjectId
      const objectId = new ObjectId(id);

      // Eliminar el documento por su ObjectId
      const result = await collection.deleteOne({ _id: objectId });

      if (result.deletedCount === 1) {
        reply.status(200).send(`Mensaje con ID ${id} eliminado correctamente.`);
      } else {
        reply.status(404).send(`No se encontró ningún mensaje con ID ${id}.`);
      }
    } catch (error) {
      console.error("Error al eliminar mensaje:", error);
      reply.status(500).send("Error interno al intentar eliminar el mensaje.");
    }
  });
};
