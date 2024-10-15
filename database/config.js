const mongoose = require('mongoose');
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.DB_CNN, clientOptions).then(() => {
          console.log('mongo connected');
        }).catch((error) => {
          console.log(error);
        });
    } catch (error) {
        console.log(error);
        throw new Error('Error en la base de datos - Hable con el admin');
    }
}

module.exports = {
    dbConnection
}