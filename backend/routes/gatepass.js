const express = require('express');
const router = express.Router();
const {
  applyGatepass,
  getStudentById,
  updateGatepassStatus,
  getStudentHistory,
  getPendingRequests,
  getProcessedRequests
} = require('../controllers/gatepassController');
const auth = require('../middleware/auth');

// @route   POST api/gatepass/apply
// @desc    Apply for a new gatepass
// @access  Private (Student)
router.post('/apply', auth, applyGatepass);

// @route   GET api/gatepass/fetchById/:idNo
// @desc    Fetch student details by their ID number
// @access  Private
router.get('/fetchById/:idNo', auth, getStudentById);

// @route   PUT api/gatepass/updateStatus/:id
// @desc    Approve or reject a gatepass
// @access  Private (Authority)
router.put('/updateStatus/:id', auth, updateGatepassStatus);

// @route   GET api/gatepass/history
// @desc    Get a student's gatepass history
// @access  Private (Student)
router.get('/history', auth, getStudentHistory);

// @route   GET api/gatepass/pending
// @desc    Get all pending gatepass requests
// @access  Private (Authority)
router.get('/pending', auth, getPendingRequests);

// @route   GET api/gatepass/processed
// @desc    Get all processed (approved/rejected) gatepass requests
// @access  Private (Authority)
router.get('/processed', auth, getProcessedRequests);


module.exports = router;
