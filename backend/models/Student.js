const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  idNo: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  rollNo: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  division: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  roomNo: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
