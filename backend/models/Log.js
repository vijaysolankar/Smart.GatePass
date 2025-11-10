const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  gatepass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gatepass',
    required: true,
  },
  actualOut: {
    type: Date,
  },
  actualIn: {
    type: Date,
  },
  outScannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  inScannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, { timestamps: true });

module.exports = mongoose.model('Log', LogSchema);
