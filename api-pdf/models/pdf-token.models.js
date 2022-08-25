const mongoose = require('mongoose');
var moment = require('moment-timezone');

const PdfTokenSchema = new mongoose.Schema({
  id: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  tokens: {
    type: Object,
    required: false,
  },
  ref: {
    type: String,
    required: false,
  },
  config_id: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  }
}, {
  timestamps: {
    currentTime: () => moment()
  }
});

module.exports = mongoose.model('pdf_token', PdfTokenSchema);