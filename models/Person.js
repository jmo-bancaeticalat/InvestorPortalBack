const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
    idCountry: {
        type: String,
    },
    legalPerson: {
        type: Boolean,
    },
    idTypePerson: {
        type: String,
    },
    name: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
    },
    dni: {
        type: String,
    },
    phone: {
        type: String,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true
    },
    idContactChannel: {
        type: String,
    },
    termsCondition: {
        type: Boolean,
    },
    dataPolicyCheck: {
        type: Boolean,
    },
    dniPictureFront:{
        filename: { type: String },
        contentType: { type: String},
        uploadDate: { type: Date, default: Date.now }
    },
    dniPictureBack:{
        type: String,
    },
    idMaritalStatus: {
        type: Number,
    },
    idLaboralActivity: {
        type: String,
    },
    professionoroccupation: {
        type: String,
    },
    idEducationLevel: {
        type: String,
    },
    idIncomeRange: {
        type: String,
    },
    idCity: {
        type: String,
    },
    address: {
        type: String,
    },
    idAgeRange: {
        type: String,
    },
    pepCheck :{
        type: Boolean,
    },
    amlCheck: {
        type: Boolean,
    },
    idImpactProfile: {
        type: Number,
    },
    idUser: {
        type: Number,
    },
    politicallyExposedPerson: {
        type: Boolean,
    },
    taxResidence:{
        type: Boolean,
    },
    usaCitizen: {
        type: Boolean,
    },
    qualifiedInvestor: {
        type: Boolean,
    },
    password: {
        type: String,
    },
    repassword: {
        type: String,
    },
    management: {
        type: String,
    },
    area: {
        type: String,
    },
    investorProfile: {
        type: String,
    },
    investOffer: {
        type: String,
    },
    comments: {
        type: String,
    },
    birthday: {
        type: Date,
    },
    registrationDate: {
         type: Date, default: Date.now 
    },
    updateDate: {
        type: Date, default: Date.now 
   },
   registrationCode1: {
    type: Number,
   },
   registrationCode2: {
    type: Number,
   },
   registrationCode3: {
    type: Number,
   },
   registrationCode4: {
    type: Number,
   },
   inversorprofile: {
    type: String,
   },
   responsibleexecutive: {
    type: String,
   },
   inversorstate: {
    type: String,
   },
   stateofprocess: {
    type: String,
   },
   result: {
    type: String,
   },
    done: {
        type: Boolean,
        default: false
    },

});

const Person = mongoose.model('Person', personSchema);

module.exports = { Person };
