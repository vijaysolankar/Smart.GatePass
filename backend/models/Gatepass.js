const mongoose = require('mongoose');

const GatepassSchema = new mongoose.Schema({
  passNo: {
    type: String,
    required: true,
    unique: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: false, // No longer required, for manual entries
  },
  // Fields for manual entry
  studentName: {
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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  outTime: {
    type: Date,
    required: true,
  },
  inTime: {
    type: Date,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  actionDate: {
    type: Date,
  }
}, { timestamps: true });

module.exports = mongoose.model('Gatepass', GatepassSchema);
