const mongoose = require("mongoose");

async function connectToMongoDB() {
    try {
        await mongoose.connect(process.env.URI_MONGO, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Configuración de GridFS en Mongoose
        const conn = mongoose.connection;
        let gfs;
        conn.once('open', () => {
            gfs = new mongoose.mongo.GridFSBucket(conn.db, {
                bucketName: 'uploads' // Nombre del bucket para almacenar los archivos
            });
        });

        console.log("Conexión OK");
    } catch (error) {
        console.log("Error de conexión a mongodb:" + error);
    }
}

connectToMongoDB(); // Llama a la función para conectar a MongoDB
