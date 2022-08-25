const mongoose = require('mongoose');
var moment = require('moment-timezone');

var PdfConfigSchema = new mongoose.Schema({
  document_template_name: { type: String, required: true },
  document_id: { type: String, required: true },
  document_folder_id: { type: String, required: true },
  document_user_id: { type: String, required: false },
  document_api_url: { type: String, required: false },
  document_data_id: { type: String, required: false },
  client_secret: { type: String, required: true },
  client_id: { type: String, required: true },
  script_class: { type: String, required: true },
  script_version: { type: Number, required: true },
  script_by_user: { type: String, required: false },
  script_group_id: { type: String, required: false },
  script_by_user_uid: { type: String, required: false },
  script: { type: String, required: true },
  script_status: { type: Boolean, required: true, default: true },
  
}, {
  timestamps: {
    currentTime: () => moment()
  }
});

module.exports = mongoose.model('pdf_config',PdfConfigSchema);