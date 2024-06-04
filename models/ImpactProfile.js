const mongoose = require('mongoose');

const impactProfileSchema = new mongoose.Schema({
    idPerson: {
        type: String,
        required: true,
        trim: true
    },
    financialKnowlegde: {
        type: String,
        required: true,
        trim: true
    },
    pastInvestment: {
        type: String,
    },
    durationInvest: {
        type: String,
    },
    moneyNeed: {
        type: String,
    },
    impactPreferences: {
        type: String,
    },
    investmentGoal: {
        type: String,
    },
    investmentChoose: {
        type: String,
    },
    variableInvestment: {
        type: String,
    },
});

const ImpactProfile = mongoose.model('ImpactProfile', impactProfileSchema);

module.exports = { ImpactProfile };
