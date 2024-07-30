const mongoose = require('mongoose');

const contactusSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: Number,
  subject: String,
  description: String,
});

const Contactus = mongoose.model('Contactus', contactusSchema);

module.exports = Contactus;
