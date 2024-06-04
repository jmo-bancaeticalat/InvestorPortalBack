const mongoose = require('mongoose');

const RRRLLSchema = new mongoose.Schema({
    rut: {
        type: String,
    },
    nombre: {
        type: String,
    },
    apellido: {
        type: String,
    },
    telefono: {
        type: String,
    },
    correo: {
        type: String,
    },
    fullname: {
        type: String,
    },
    _update: {
        type: Boolean,
    },
    _delete: {
        type: Boolean,
    },
});

const BankSchema = new mongoose.Schema({
    banco: {
        type: Number,
    },
    tipo_cuenta: {
        type: Number,
    },
    cuenta: {
        type: String,
    },
    _update: {
        type: Boolean,
    },
    _delete: {
        type: Boolean,
    }
});

const personPlatformSchema = new mongoose.Schema({
    _zone: {
        type: String,
    },
    rut: {
        type: String,
    },
    firstname: {
        type: String,
    },
    lastname: {
        type: String,
    },
    email: {
        type: String,
    },
    lastlog: {
        type: Date,
    },
    phone: {
        type: String,
    },
    hasMutual: {
        type: Boolean,
    },
    rrll: {
        type: [RRRLLSchema],
    },
    banco: {
        type: [BankSchema],
    },
    creationUserModel: {
        type: String,
    },
    updateUserModel: {
        type: String,
    },
    canTranslate: {
        type: Boolean,
    },
    investments : {
        type: [String],
    },
    _update: {
        type: Boolean,
    },
    _delete: {
        type: Boolean,
    },
    creationDate: {
        type: Date,
    },
    updateDate: {
        type: Date,
    },
    updateUser: {
        type: Date,
    },
    _id: {
        type: String,
    }
});

const PersonPlatform = mongoose.model('PersonPlatform', personPlatformSchema);

module.exports = { PersonPlatform };
