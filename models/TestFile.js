const mongoose = require('mongoose');

const testFileSchema = new mongoose.Schema({
  text: { type: String },
  number1: {type: Number},
  number2: {type: Number}
});

const TestFile = mongoose.model('TestFile', testFileSchema);

module.exports = { TestFile };
