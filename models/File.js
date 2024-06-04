const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  contentType: { type: String, required: true },
  uploadDate: { type: Date, required: true, default: Date.now }
});

const File = mongoose.model('File', fileSchema);

module.exports = { File };
