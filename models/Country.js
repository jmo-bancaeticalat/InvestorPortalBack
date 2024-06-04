const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    phoneCode: {
        type: String,
    }
});

const Country = mongoose.model('Country', countrySchema);

module.exports = { Country };
